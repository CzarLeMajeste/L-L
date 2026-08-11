import { useMemo, useState } from 'react'
import { ArrowLeft, Flag, MessageCircle, Send, ShieldCheck, ThumbsUp } from 'lucide-react'
import type { Listing } from '../lib/types'
import type { BoarderProfile } from '../components/BoarderAccess'

interface Props { listing: Listing; profile: BoarderProfile | null; onBack: () => void; onSignIn: () => void }
interface Post { id: string; author: string; title: string; body: string; votes: number; comments: number; createdAt: string; reported?: boolean }

const seedPosts = (listing: Listing): Post[] => [
  { id: `${listing.id}-welcome`, author: 'Verified boarder', title: 'What is it like living here?', body: 'Share honest notes about noise, water, study spaces, and the walk or ride to campus.', votes: 12, comments: 4, createdAt: 'Today' },
  { id: `${listing.id}-utilities`, author: 'Anonymous boarder', title: 'Questions about utilities and house rules', body: 'Keep replies practical and respectful so future boarders know what to expect.', votes: 7, comments: 2, createdAt: 'Yesterday' },
]

export function CommunityView({ listing, profile, onBack, onSignIn }: Props) {
  const storageKey = `boarder-community-${listing.id}`
  const [posts, setPosts] = useState<Post[]>(() => JSON.parse(localStorage.getItem(storageKey) ?? 'null') ?? seedPosts(listing))
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(Number(localStorage.getItem('boarder-last-post') ?? 0))
  const sortedPosts = useMemo(() => [...posts].sort((a, b) => b.votes - a.votes), [posts])

  const save = (next: Post[]) => { setPosts(next); localStorage.setItem(storageKey, JSON.stringify(next)) }
  const createPost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!profile?.verified) return setError('Verify your student ID before posting.')
    if (Date.now() - cooldown < 30_000) return setError('Please wait a little before posting again.')
    const normalized = `${title} ${body}`.trim().toLowerCase()
    if (normalized.length < 20) return setError('Add a little more detail so the community can help.')
    if ((normalized.match(/https?:\/\//g) ?? []).length > 1) return setError('Posts may include at most one link.')
    if (posts.some((post) => `${post.title} ${post.body}`.toLowerCase() === normalized)) return setError('That post already exists.')
    const nextPost = { id: crypto.randomUUID(), author: profile.displayName, title: title.trim(), body: body.trim(), votes: 1, comments: 0, createdAt: 'Just now' }
    save([nextPost, ...posts]); setTitle(''); setBody(''); localStorage.setItem('boarder-last-post', String(Date.now())); setCooldown(Date.now())
  }

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="btn-ghost mb-4"><ArrowLeft className="h-4 w-4" /> Back to houses</button>
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-lift sm:p-8">
        <span className="chip bg-white/15 text-white"><ShieldCheck className="h-3.5 w-3.5" /> House community</span>
        <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{listing.title}</h1>
        <p className="mt-2 text-sm text-brand-50">A private, student-ID-verified discussion space for boarders and future boarders.</p>
      </div>
      {!profile && <div className="card mb-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-ink-900">Want to ask the house community?</p><p className="mt-1 text-xs text-ink-500">Create an account and verify your student ID to post.</p></div><button onClick={onSignIn} className="btn-primary"><ShieldCheck className="h-4 w-4" /> Join community</button></div>}
      {profile && <form onSubmit={createPost} className="card mb-5 space-y-3 p-5"><div className="flex items-center justify-between"><h2 className="font-display text-sm font-bold text-ink-900">Start a discussion</h2><span className="chip bg-brand-50 text-brand-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified boarder</span></div><input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" maxLength={100} /><textarea className="input min-h-24 resize-y" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Ask about utilities, house rules, safety, or daily boarder life..." maxLength={1000} />{error && <p className="text-xs font-medium text-red-600">{error}</p>}<button className="btn-primary self-start" type="submit"><Send className="h-4 w-4" /> Post anonymously</button></form>}
      <div className="space-y-3">{sortedPosts.map((post) => <article key={post.id} className="card p-5"><div className="flex gap-4"><div className="flex shrink-0 flex-col items-center gap-1 text-ink-400"><button onClick={() => save(posts.map((item) => item.id === post.id ? { ...item, votes: item.votes + 1 } : item))} aria-label="Upvote post"><ThumbsUp className="h-4 w-4" /></button><span className="text-xs font-bold text-ink-700">{post.votes}</span></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-base font-bold text-ink-900">{post.title}</h2><p className="mt-1 text-[11px] text-ink-400">{post.author} · {post.createdAt}</p></div><button onClick={() => save(posts.map((item) => item.id === post.id ? { ...item, reported: true } : item))} className="text-ink-300 hover:text-red-500" aria-label="Report post"><Flag className="h-4 w-4" /></button></div><p className="mt-3 text-sm leading-relaxed text-ink-600">{post.body}</p><div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink-400"><MessageCircle className="h-3.5 w-3.5" /> {post.comments} comments</div>{post.reported && <p className="mt-2 text-[11px] text-red-600">Reported for moderator review.</p>}</div></div></article>)}</div>
    </div>
  )
}
