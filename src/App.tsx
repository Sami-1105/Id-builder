import { useState, useRef, useCallback, useEffect, type ChangeEvent } from 'react'
import html2canvas from 'html2canvas'

// ─── types ────────────────────────────────────────────────────────────────────
interface Member {
  id: string
  name: string
  role: string
  squad: string
  title: string
  photo: string | null
  badgeId: string
}

type Frame = 'sunset' | 'dusk' | 'tide'
type Step = 1 | 2 | 3 | 4

// ─── constants ────────────────────────────────────────────────────────────────
const FRAMES: { id: Frame; label: string; from: string; to: string }[] = [
  { id: 'sunset', label: 'SUNSET', from: '#FFB238', to: '#FF6F5E' },
  { id: 'dusk',   label: 'DUSK',   from: '#9B6BFF', to: '#37B6A6' },
  { id: 'tide',   label: 'TIDE',   from: '#37B6A6', to: '#FFB238' },
]

const CONFETTI_COLORS = ['#FFB238', '#FF6F5E', '#9B6BFF', '#37B6A6']

function mkId() {
  return 'HH-26-' + String(Math.floor(Math.random() * 9000) + 1000)
}

function newMember(overrides: Partial<Member> = {}): Member {
  return {
    id: crypto.randomUUID(),
    name: '',
    role: '',
    squad: '',
    title: '',
    photo: null,
    badgeId: mkId(),
    ...overrides,
  }
}

// ─── Aurora background ────────────────────────────────────────────────────────
function Aurora() {
  const stars = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1.5,
      left: Math.random() * 100,
      top: Math.random() * 70,
      delay: Math.random() * 3,
    }))
  )
  return (
    <>
      <div className="aurora-blob" style={{ width: 340, height: 340, background: '#FF6F5E', top: -80, left: -60, animationDuration: '16s' }} />
      <div className="aurora-blob" style={{ width: 300, height: 300, background: '#9B6BFF', bottom: -100, right: -40, animationDuration: '20s', animationDelay: '2s' }} />
      <div className="aurora-blob" style={{ width: 220, height: 220, background: '#FFB238', top: '40%', left: '60%', animationDuration: '18s', animationDelay: '4s' }} />
      {stars.current.map(s => (
        <div
          key={s.id}
          className="twinkle-star"
          style={{ width: s.size, height: s.size, left: `${s.left}vw`, top: `${s.top}vh`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step, mode }: { step: Step; mode: 'solo' | 'squad' }) {
  const steps = ['CHOOSE', 'DETAILS', 'FRAME', mode === 'squad' ? 'SQUAD' : 'BADGE']
  return (
    <div className="relative z-10 max-w-xl mx-auto mt-8 mb-2 flex justify-between px-6">
      {steps.map((label, i) => {
        const n = (i + 1) as Step
        const isActive = n === step
        const isDone = n < step
        return (
          <div key={n} className="flex flex-col items-center gap-1.5 flex-1 relative" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.08em' }}>
            {/* connector line */}
            {i < steps.length - 1 && (
              <div className="absolute top-[13px] left-1/2 w-full h-0.5 z-[-1]"
                style={{ background: isDone ? '#FFB238' : '#7A6C8C' }} />
            )}
            <div
              className="w-6.5 h-6.5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
              style={{
                width: 26, height: 26,
                border: `2px solid ${isDone ? '#FFB238' : isActive ? '#FFB238' : '#7A6C8C'}`,
                background: isDone ? '#FFB238' : '#150E22',
                color: isDone ? '#20142F' : isActive ? '#FFB238' : '#7A6C8C',
                boxShadow: isActive ? '0 0 12px rgba(255,178,56,0.5)' : 'none',
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 12,
              }}
            >
              {isDone ? '✓' : n}
            </div>
            <span style={{ color: isActive || isDone ? '#FBF1E1' : '#7A6C8C' }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Photo dropzone ───────────────────────────────────────────────────────────
function PhotoDrop({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onChange(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragEnter={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
        className="mt-2 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 overflow-hidden"
        style={{
          borderColor: drag ? '#FF6F5E' : value ? '#37B6A6' : '#7A6C8C',
          background: value ? '#F2E2C4' : drag ? '#fff' : '#F2E2C4',
          padding: value ? 0 : '24px 16px',
        }}
      >
        {value ? (
          <img src={value} alt="photo preview" className="w-full h-24 object-cover photo-kenburns" />
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#20142F' }}>Drop photo or tap to browse</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#7A6C8C', marginTop: 4 }}>head & shoulders · square works best</div>
          </>
        )}
      </div>
      {value && (
        <button onClick={() => onChange(null)} className="mt-1 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#7A6C8C', background: 'none', border: 'none', cursor: 'pointer' }}>
          × remove photo
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])} />
    </div>
  )
}

// ─── Member form card ─────────────────────────────────────────────────────────
function MemberCard({ member, index, onChange, onRemove, canRemove }: {
  member: Member
  index: number
  onChange: (m: Member) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const field = (key: keyof Member) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...member, [key]: e.target.value })

  return (
    <div className="rounded-2xl p-5 mb-4 relative" style={{ background: '#fff', border: '2px solid #F2E2C4', color: '#20142F' }}>
      <div className="flex justify-between items-center mb-4">
        <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 16, color: '#20142F' }}>
          Member {index + 1}
        </span>
        {canRemove && (
          <button onClick={onRemove} className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors" style={{ background: '#F2E2C4', color: '#7A6C8C', border: 'none', cursor: 'pointer', fontFamily: "'Fredoka', sans-serif" }}>
            ✕
          </button>
        )}
      </div>

      <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: '0.08em', color: '#7A6C8C', marginBottom: 6 }}>FULL NAME</label>
      <input
        type="text" value={member.name} onChange={field('name')} placeholder="e.g. Sanskriti Maheshwari" maxLength={40}
        className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold transition-all"
        style={{ border: '2px solid #F2E2C4', background: '#fff', color: '#20142F', outline: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14 }}
        onFocus={e => { e.currentTarget.style.borderColor = '#FF6F5E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,111,94,0.15)' }}
        onBlur={e => { e.currentTarget.style.borderColor = '#F2E2C4'; e.currentTarget.style.boxShadow = 'none' }}
      />

      <div className="grid grid-cols-2 gap-3.5 mt-4">
        <div>
          <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: '0.08em', color: '#7A6C8C', marginBottom: 6 }}>ROLE</label>
          <input
            type="text" value={member.role} onChange={field('role')} placeholder="Builder" maxLength={24}
            className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold transition-all"
            style={{ border: '2px solid #F2E2C4', background: '#fff', color: '#20142F', outline: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#FF6F5E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,111,94,0.15)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#F2E2C4'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: '0.08em', color: '#7A6C8C', marginBottom: 6 }}>SQUAD / TEAM</label>
          <input
            type="text" value={member.squad} onChange={field('squad')} placeholder="Individual" maxLength={24}
            className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold transition-all"
            style={{ border: '2px solid #F2E2C4', background: '#fff', color: '#20142F', outline: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#FF6F5E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,111,94,0.15)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#F2E2C4'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>
      </div>

      <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: '0.08em', color: '#7A6C8C', margin: '16px 0 6px' }}>BUILDER TITLE <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
      <input
        type="text" value={member.title} onChange={field('title')} placeholder="Full Stack Developer" maxLength={40}
        className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold transition-all"
        style={{ border: '2px solid #F2E2C4', background: '#fff', color: '#20142F', outline: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14 }}
        onFocus={e => { e.currentTarget.style.borderColor = '#FF6F5E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,111,94,0.15)' }}
        onBlur={e => { e.currentTarget.style.borderColor = '#F2E2C4'; e.currentTarget.style.boxShadow = 'none' }}
      />

      <label style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: '0.08em', color: '#7A6C8C', margin: '16px 0 0' }}>PHOTO</label>
      <PhotoDrop value={member.photo} onChange={v => onChange({ ...member, photo: v })} />
    </div>
  )
}

// ─── ID Badge card ─────────────────────────────────────────────────────────────
function BadgeCard({ member, frame, animate }: { member: Member; frame: Frame; animate: boolean }) {
  const badgeRef = useRef<HTMLDivElement>(null)

  const frameGrad = FRAMES.find(f => f.id === frame)!
  const chipBg: Record<Frame, { role: string; squad: string }> = {
    sunset: { role: '#FFB238', squad: '#FF6F5E' },
    dusk:   { role: '#9B6BFF', squad: '#37B6A6' },
    tide:   { role: '#37B6A6', squad: '#FFB238' },
  }

  function download() {
    if (!badgeRef.current) return
    html2canvas(badgeRef.current, { backgroundColor: null, scale: 2, useCORS: true }).then(canvas => {
      const link = document.createElement('a')
      const slug = (member.name || 'builder').replace(/\s+/g, '_')
      link.download = `${slug}_hhgoa26_badge.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    })
  }

  function shareToX() {
    const text = encodeURIComponent(`Just built my Hacker House Goa'26 Builder ID as ${member.role || 'Builder'} 🌅 #FrameInGoa @247pmstudio`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  return (
    <div className="flex flex-col items-stretch">
      {/* Badge wrapper — gradient border */}
      <div
        ref={badgeRef}
        className={animate ? 'badge-flip' : ''}
        style={{
          background: `linear-gradient(160deg, ${frameGrad.from}, ${frameGrad.to})`,
          borderRadius: 22,
          padding: 4,
          boxShadow: '0 22px 44px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ background: '#FBF1E1', borderRadius: 18, padding: 20, color: '#20142F' }}>
          {/* Header row */}
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-2.5">
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${frameGrad.from}, ${frameGrad.to})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 13,
                color: '#20142F', transform: 'rotate(-6deg)',
              }}>HH</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#7A6C8C', lineHeight: 1.3 }}>
                <b style={{ display: 'block', color: '#20142F', fontSize: 11 }}>HACKER HOUSE GOA'26</b>
                COLLECTIBLE BUILDER BADGE
              </div>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: '#7A6C8C', textAlign: 'right' }}>
              {member.badgeId}
            </div>
          </div>

          {/* Photo */}
          <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden', background: '#F2E2C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover photo-kenburns" />
            ) : (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#7A6C8C' }}>no photo</span>
            )}
          </div>

          {/* Name & title */}
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, margin: '12px 0 2px', lineHeight: 1.2 }}>
            {member.name || 'Your Name'}
          </div>
          <div style={{ fontSize: 12.5, color: '#7A6C8C', marginBottom: 10 }}>
            {member.title || 'Builder title shows here'}
          </div>

          {/* Chips */}
          <div className="flex gap-2 flex-wrap">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '5px 10px', borderRadius: 999, background: chipBg[frame].role, color: '#20142F' }}>
              {member.role || 'Builder'}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '5px 10px', borderRadius: 999, background: chipBg[frame].squad, color: frame === 'sunset' ? '#20142F' : '#fff' }}>
              {member.squad || 'Individual'}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '5px 10px', borderRadius: 999, background: 'transparent', border: '1.5px solid #F2E2C4', color: '#7A6C8C' }}>
              #FrameInGoa
            </span>
          </div>
        </div>
      </div>

      {/* Per-badge actions */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={download}
          className="rounded-xl py-2.5 text-xs font-semibold transition-transform active:scale-95"
          style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, background: `linear-gradient(90deg, ${frameGrad.from}, ${frameGrad.to})`, color: '#20142F', border: 'none', cursor: 'pointer' }}
        >
          Download ⬇
        </button>
        <button
          onClick={shareToX}
          className="rounded-xl py-2.5 text-xs font-semibold transition-transform active:scale-95"
          style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, background: '#fff', color: '#20142F', border: '2px solid #F2E2C4', cursor: 'pointer' }}
        >
          Share 𝕏
        </button>
      </div>
    </div>
  )
}

// ─── Generating screen ─────────────────────────────────────────────────────────
function Generating({ count }: { count: number }) {
  return (
    <div style={{ background: '#FBF1E1', borderRadius: 22, padding: 32, color: '#20142F', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px' }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFB238" />
              <stop offset="100%" stopColor="#FF6F5E" />
            </linearGradient>
          </defs>
          <circle className="ring-bg" cx="70" cy="70" r="60" fill="none" stroke="#F2E2C4" strokeWidth="8" />
          <circle className="ring-animate" cx="70" cy="70" r="60" fill="none" stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="377" strokeDashoffset="377" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka', sans-serif", fontSize: 22, color: '#20142F' }}>
          🌅
        </div>
      </div>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, marginBottom: 14 }}>
        Pressing {count > 1 ? `${count} badges` : 'it'} to Goa…
      </div>
      <ul style={{ textAlign: 'left', maxWidth: 260, margin: '0 auto', padding: 0 }}>
        {['Locking photos in', 'Painting the frames', 'Stamping role badges', `Minting ${count} badge ID${count > 1 ? 's' : ''}`].map((text, i) => (
          <li key={i} style={{ listStyle: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: '6px 0', color: '#7A6C8C', display: 'flex', alignItems: 'center', gap: 8, opacity: 0, animation: 'popIn .4s ease forwards', animationDelay: `${0.2 + i * 0.6}s` }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#37B6A6', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Confetti ──────────────────────────────────────────────────────────────────
function launchConfetti() {
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div')
    p.className = 'confetti-piece'
    p.style.left = Math.random() * 100 + 'vw'
    p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    p.style.animationDelay = Math.random() * 0.5 + 's'
    p.style.animationDuration = 2 + Math.random() * 1.2 + 's'
    document.body.appendChild(p)
    setTimeout(() => p.remove(), 3500)
  }
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState<Step>(1)
  const [mode, setMode] = useState<'solo' | 'squad'>('solo')
  const [members, setMembers] = useState<Member[]>([newMember()])
  const [frame, setFrame] = useState<Frame>('sunset')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [badgesReady, setBadgesReady] = useState<Member[]>([])
  const [animateBadges, setAnimateBadges] = useState(false)

  function updateMember(id: string, updated: Member) {
    setMembers(ms => ms.map(m => m.id === id ? updated : m))
  }

  function removeMember(id: string) {
    setMembers(ms => ms.filter(m => m.id !== id))
  }

  function addMember() {
    setMembers(ms => [...ms, newMember()])
  }

  function goTo(s: Step) {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGenerate = useCallback(() => {
    // assign fresh badge IDs to all members before generating
    const stamped = members.map(m => ({ ...m, badgeId: mkId() }))
    setGenerating(true)
    setGenerated(false)
    setStep(4)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
      setBadgesReady(stamped)
      setAnimateBadges(true)
      launchConfetti()
      setTimeout(() => setAnimateBadges(false), 1200)
    }, 2800)
  }, [members])

  function resetAll() {
    setStep(1)
    setMode('solo')
    setMembers([newMember()])
    setFrame('sunset')
    setGenerating(false)
    setGenerated(false)
    setBadgesReady([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // When switching from squad→solo, keep only first member
  useEffect(() => {
    if (mode === 'solo' && members.length > 1) {
      setMembers(ms => [ms[0]])
    }
  }, [mode])

  const displayStep: Step = generating || generated ? 4 : step

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <Aurora />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '44px 20px 18px' }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.16em',
          color: '#FFB238', border: '1px solid rgba(255,178,56,0.5)', background: 'rgba(32,20,47,0.5)',
          padding: '6px 14px', borderRadius: 999, display: 'inline-block', marginBottom: 16
        }}>
          HH GOA'26 // ID WIZARD
        </span>
        <h1 style={{
          fontFamily: "'Fredoka', sans-serif", fontWeight: 600,
          fontSize: 'clamp(28px, 5.4vw, 48px)', margin: '0 0 10px',
          background: 'linear-gradient(90deg, #FFB238, #FF6F5E)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>
          Build Your Badge,<br />Step by Step
        </h1>
        <p style={{ color: '#CFC2E0', maxWidth: 460, margin: '0 auto', fontSize: 15 }}>
          Pick your path, drop your details, choose a frame — generate badges for your whole squad at once.
        </p>
      </header>

      {/* Stepper */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Stepper step={displayStep} mode={mode} />
      </div>

      {/* Wizard */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '30px auto 100px', padding: '0 24px' }}>

        {/* ── STEP 1: Choose ── */}
        {step === 1 && !generating && !generated && (
          <div className="screen-enter">
            <div style={{ background: '#FBF1E1', color: '#20142F', borderRadius: 22, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
              <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, margin: '0 0 6px' }}>Choose your build</h2>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#7A6C8C', margin: '0 0 22px' }}>// solo badge, or generate for your whole squad</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'solo' as const, emoji: '🏄', title: 'Solo Builder', desc: 'One builder, one badge. Fastest path to your ID.' },
                  { type: 'squad' as const, emoji: '🛖', title: 'Squad Mode', desc: 'Add your whole team and generate the full set together.' },
                ].map(opt => (
                  <div
                    key={opt.type}
                    onClick={() => setMode(opt.type)}
                    className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
                    style={{
                      border: `2px solid ${mode === opt.type ? '#FF6F5E' : '#F2E2C4'}`,
                      boxShadow: mode === opt.type ? '0 0 0 3px rgba(255,111,94,0.2)' : 'none',
                      background: '#fff',
                      transform: mode === opt.type ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 26 }}>{opt.emoji}</div>
                    <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 16, margin: '10px 0 4px', color: '#20142F' }}>{opt.title}</h3>
                    <p style={{ fontSize: 12, color: '#7A6C8C', margin: 0, lineHeight: 1.4 }}>{opt.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => goTo(2)}
                  className="flex-1 rounded-xl py-3.5 font-semibold relative overflow-hidden transition-transform active:scale-[0.97]"
                  style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, background: 'linear-gradient(90deg, #FFB238, #FF6F5E)', color: '#20142F', border: 'none', cursor: 'pointer' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Details ── */}
        {step === 2 && !generating && !generated && (
          <div className="screen-enter">
            <div style={{ background: '#FBF1E1', color: '#20142F', borderRadius: 22, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
              <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, margin: '0 0 6px' }}>
                {mode === 'squad' ? 'Squad details' : 'Your details'}
              </h2>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#7A6C8C', margin: '0 0 22px' }}>
                {mode === 'squad' ? `// ${members.length} member${members.length > 1 ? 's' : ''} · add up to 8` : '// this feeds straight into your badge'}
              </p>

              {members.map((m, i) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  index={i}
                  onChange={updated => updateMember(m.id, updated)}
                  onRemove={() => removeMember(m.id)}
                  canRemove={members.length > 1}
                />
              ))}

              {mode === 'squad' && members.length < 8 && (
                <button
                  onClick={addMember}
                  className="w-full rounded-2xl py-3.5 mb-4 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    fontFamily: "'Fredoka', sans-serif", fontSize: 15,
                    border: '2px dashed #9B6BFF', background: 'rgba(155,107,255,0.05)',
                    color: '#9B6BFF', cursor: 'pointer'
                  }}
                >
                  + Add squad member
                </button>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => goTo(1)} className="rounded-xl px-5 py-3.5 font-semibold transition-transform active:scale-[0.97]" style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, background: 'transparent', color: '#20142F', border: '2px solid #F2E2C4', cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={() => goTo(3)}
                  className="flex-1 rounded-xl py-3.5 font-semibold transition-transform active:scale-[0.97]"
                  style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, background: 'linear-gradient(90deg, #FFB238, #FF6F5E)', color: '#20142F', border: 'none', cursor: 'pointer' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Frame ── */}
        {step === 3 && !generating && !generated && (
          <div className="screen-enter">
            <div style={{ background: '#FBF1E1', color: '#20142F', borderRadius: 22, padding: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
              <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 22, margin: '0 0 6px' }}>Choose your frame</h2>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#7A6C8C', margin: '0 0 22px' }}>// one style applied to {mode === 'squad' ? `all ${members.length} badges` : 'your badge'}</p>
              <div className="grid grid-cols-3 gap-3.5">
                {FRAMES.map(f => (
                  <div
                    key={f.id}
                    onClick={() => setFrame(f.id)}
                    className="rounded-2xl p-3 cursor-pointer text-center transition-all duration-200"
                    style={{
                      border: `2px solid ${frame === f.id ? '#9B6BFF' : '#F2E2C4'}`,
                      boxShadow: frame === f.id ? '0 0 0 3px rgba(155,107,255,0.2)' : 'none',
                      background: '#fff',
                      transform: frame === f.id ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <div style={{ height: 60, borderRadius: 8, marginBottom: 8, background: `linear-gradient(135deg, ${f.from}, ${f.to})` }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#7A6C8C' }}>{f.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => goTo(2)} className="rounded-xl px-5 py-3.5 font-semibold transition-transform active:scale-[0.97]" style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, background: 'transparent', color: '#20142F', border: '2px solid #F2E2C4', cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 rounded-xl py-3.5 font-semibold transition-transform active:scale-[0.97]"
                  style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, background: 'linear-gradient(90deg, #FFB238, #FF6F5E)', color: '#20142F', border: 'none', cursor: 'pointer' }}
                >
                  Press it to Goa 🌅
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Generating ── */}
        {generating && (
          <div className="screen-enter">
            <Generating count={members.length} />
          </div>
        )}

        {/* ── STEP 4: Results ── */}
        {generated && !generating && (
          <div className="screen-enter">
            {/* Squad header */}
            {badgesReady.length > 1 && (
              <div className="text-center mb-6">
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.16em',
                  color: '#37B6A6', border: '1px solid rgba(55,182,166,0.5)', background: 'rgba(32,20,47,0.5)',
                  padding: '6px 14px', borderRadius: 999, display: 'inline-block', marginBottom: 12
                }}>
                  {badgesReady.length} BADGES GENERATED 🎉
                </span>
                <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 26, margin: 0, background: 'linear-gradient(90deg, #37B6A6, #9B6BFF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  Your Squad is in Goa!
                </h2>
              </div>
            )}

            {/* Badge grid */}
            <div
              className={badgesReady.length === 1 ? '' : 'grid gap-6'}
              style={badgesReady.length > 1 ? { gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' } : {}}
            >
              {badgesReady.map((m, i) => (
                <BadgeCard key={m.id} member={m} frame={frame} animate={animateBadges} />
              ))}
            </div>

            {/* Download all button for squad */}
            {badgesReady.length > 1 && (
              <button
                onClick={() => {
                  // trigger download on all cards sequentially
                  document.querySelectorAll<HTMLButtonElement>('.badge-dl-btn').forEach((btn, i) => {
                    setTimeout(() => btn.click(), i * 400)
                  })
                }}
                className="w-full mt-6 rounded-xl py-3.5 font-semibold transition-transform active:scale-[0.98]"
                style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, background: 'linear-gradient(90deg, #9B6BFF, #37B6A6)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Download All {badgesReady.length} Badges ⬇
              </button>
            )}

            {/* Links */}
            <div style={{ textAlign: 'center', marginTop: 22, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
              <button onClick={resetAll} style={{ color: '#FFB238', background: 'none', border: 'none', cursor: 'pointer', margin: '0 8px' }}>↻ Start over</button>
              ·
              <button onClick={() => { setGenerated(false); setGenerating(false); goTo(2) }} style={{ color: '#FFB238', background: 'none', border: 'none', cursor: 'pointer', margin: '0 8px' }}>Edit details</button>
              ·
              <button onClick={() => { setGenerated(false); setGenerating(false); goTo(3) }} style={{ color: '#FFB238', background: 'none', border: 'none', cursor: 'pointer', margin: '0 8px' }}>Change frame</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
