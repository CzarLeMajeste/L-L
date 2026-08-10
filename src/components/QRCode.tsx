import { useMemo } from 'react'
import { generateQrMatrix } from '../lib/qr'

export function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  const matrix = useMemo(() => generateQrMatrix(value), [value])
  const n = matrix.length
  const cell = size / n
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#14161f" /> : null,
        ),
      )}
    </svg>
  )
}
