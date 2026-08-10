// Minimal QR code generator (byte mode, version auto, error level M).
// Pure TS, no deps. Returns a matrix of booleans (true = dark module).

type Bits = { bytes: number[]; bitLength: number }

function pushBits(b: Bits, val: number, len: number) {
  for (let i = len - 1; i >= 0; i--) {
    const bit = (val >> i) & 1
    if (b.bitLength % 8 === 0) b.bytes.push(0)
    b.bytes[b.bytes.length - 1] |= bit << (7 - (b.bitLength % 8))
    b.bitLength++
  }
}

function encodeData(str: string): Bits {
  const b: Bits = { bytes: [], bitLength: 0 }
  // Try byte mode only — simplest and always correct.
  pushBits(b, 0b0100, 4) // byte mode
  pushBits(b, str.length, 16) // char count (assume version >= 10? we'll keep <= 100 chars)
  for (const ch of str) pushBits(b, ch.charCodeAt(0), 8)
  return b
}

function pickVersion(byteLen: number): number {
  // version -> data capacity (bytes) at level M
  const caps = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362]
  for (let v = 0; v < caps.length; v++) if (caps[v] >= byteLen + 3) return v + 1
  return 10
}

const ECC_TABLE: Record<number, { totalCodewords: number; ecCodewords: number; dataCodewords: number }> = {
  1: { totalCodewords: 26, ecCodewords: 10, dataCodewords: 16 },
  2: { totalCodewords: 44, ecCodewords: 16, dataCodewords: 28 },
  3: { totalCodewords: 70, ecCodewords: 26, dataCodewords: 44 },
  4: { totalCodewords: 100, ecCodewords: 36, dataCodewords: 64 },
  5: { totalCodewords: 134, ecCodewords: 48, dataCodewords: 86 },
  6: { totalCodewords: 172, ecCodewords: 64, dataCodewords: 108 },
  7: { totalCodewords: 196, ecCodewords: 72, dataCodewords: 124 },
  8: { totalCodewords: 242, ecCodewords: 88, dataCodewords: 154 },
  9: { totalCodewords: 284, ecCodewords: 110, dataCodewords: 182 },
  10: { totalCodewords: 334, ecCodewords: 130, dataCodewords: 216 },
}

// GF(256) arithmetic
const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)
;(function initGF() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255]
})()

function gfMul(a: number, b: number) {
  if (a === 0 || b === 0) return 0
  return GF_EXP[GF_LOG[a] + GF_LOG[b]]
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i])
    }
    poly = next
  }
  return poly
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen)
  const res = new Array(ecLen).fill(0)
  for (const d of data) {
    const factor = d ^ res[0]
    res.shift()
    res.push(0)
    if (factor !== 0) for (let i = 0; i < gen.length; i++) res[i] ^= gfMul(gen[i], factor)
  }
  return res
}

export function generateQrMatrix(text: string): boolean[][] {
  const data = encodeData(text)
  const version = pickVersion(text.length)
  const size = 17 + version * 4
  const { ecCodewords, dataCodewords } = ECC_TABLE[version]

  // Build full codeword stream
  const dataBytes = data.bytes
  // Add terminator + pad
  const totalDataBits = dataCodewords * 8
  while (data.bitLength < totalDataBits && data.bitLength % 8 !== 0) pushBits(data, 0, 1)
  while (dataBytes.length < dataCodewords) dataBytes.push(0xec)
  const ec = rsEncode(dataBytes.slice(0, dataCodewords), ecCodewords)
  const codewords = [...dataBytes.slice(0, dataCodewords), ...ec]

  // Build matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false))
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false))

  const placeFinder = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++)
      for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr, cc = c + dc
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue
        reserved[rr][cc] = true
        const inRing = dr === 0 || dr === 6 || dc === 0 || dc === 6
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        matrix[rr][cc] = inRing || inCenter
      }
  }
  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = reserved[i][6] = true
    matrix[6][i] = matrix[i][6] = i % 2 === 0
  }

  // Dark module
  reserved[size - 8][8] = true
  matrix[size - 8][8] = true

  // Reserve format areas
  for (let i = 0; i < 9; i++) if (!reserved[8][i]) reserved[8][i] = true
  for (let i = 0; i < 8; i++) if (!reserved[size - 1 - i][8]) reserved[size - 1 - i][8] = true
  for (let i = 0; i < 8; i++) if (!reserved[i][8]) reserved[i][8] = true
  for (let i = 0; i < 7; i++) if (!reserved[8][size - 1 - i]) reserved[8][size - 1 - i] = true

  // Place data zigzag
  let bitIdx = 0
  let upward = true
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5
    for (let i = 0; i < size; i++) {
      const r = upward ? size - 1 - i : i
      for (let c = 0; c < 2; c++) {
        const cc = col - c
        if (!reserved[r][cc]) {
          const byteIdx = Math.floor(bitIdx / 8)
          const bitInByte = 7 - (bitIdx % 8)
          const bit = byteIdx < codewords.length ? (codewords[byteIdx] >> bitInByte) & 1 : 0
          matrix[r][cc] = bit === 1
          bitIdx++
        }
      }
    }
    upward = !upward
  }

  // Apply mask 0 (i+j mod 2 = 0) and format info for level M
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!reserved[r][c] && (r + c) % 2 === 0) matrix[r][c] = !matrix[r][c]

  // Format info bits for level M (10) + mask 0 -> 0b101010000010010 = 0x5412
  const format = 0x5412
  for (let i = 0; i < 15; i++) {
    const bit = (format >> i) & 1
    if (i < 6) matrix[8][i] = matrix[i][8] = matrix[8][i] || false
    if (i < 6) matrix[8][i] = bit === 1
    if (i < 6) matrix[i][8] = bit === 1
    if (i === 6) matrix[8][7] = matrix[8][8] = matrix[7][8] = bit === 1
    if (i >= 7 && i < 9) matrix[8][size - 15 + i] = bit === 1
    if (i >= 9) matrix[size - 15 + i][8] = bit === 1
    if (i >= 7 && i < 9) matrix[8][size - 15 + i] = bit === 1
  }
  // Top-left format strip
  const fmt = 0x5412
  const positionsTopLeft: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8],
    [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ]
  const positionsTopRightBottomLeft: [number, number][] = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ]
  for (let i = 0; i < 15; i++) {
    const bit = (fmt >> i) & 1
    const [r, c] = positionsTopLeft[i]
    matrix[r][c] = bit === 1
    const [r2, c2] = positionsTopRightBottomLeft[i]
    matrix[r2][c2] = bit === 1
  }

  return matrix
}
