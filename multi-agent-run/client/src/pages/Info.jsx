import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../styles/info.css'

function useScrollReveal() {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect() } },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, revealed]
}

// ── Scroll progress ───────────────────────────────────────────────────────────

function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />
}

// ── Blobs ─────────────────────────────────────────────────────────────────────

function Blobs({ count = 8, seed = 0 }) {
  const blobs = useMemo(() => {
    // LCG deterministic RNG — same seed always produces the same layout
    let state = seed * 9301 + 49297
    const next = () => { state = (state * 9301 + 49297) % 233280; return state / 233280 }

    const placed = []
    const results = []

    for (let i = 0; i < count; i++) {
      const size    = 80 + next() * 120    // 80–200 px
      const opacity = 0.52 + next() * 0.28
      const blue    = i % 2 === 0
      const r       = size / 2

      // Attempt up to 50 positions; keep first that doesn't overlap any placed blob
      let x = 5 + next() * 90
      let y = 5 + next() * 90
      for (let t = 0; t < 50; t++) {
        const cx = 5 + next() * 90
        const cy = 5 + next() * 90
        const overlaps = placed.some(p => {
          const dx = (cx - p.x) / 100 * 1200
          const dy = (cy - p.y) / 100 * 700
          return Math.sqrt(dx * dx + dy * dy) < (r + p.r) * 1.2
        })
        if (!overlaps) { x = cx; y = cy; break }
      }

      placed.push({ x, y, r })
      results.push({ x, y, size, blue, opacity })
    }

    return results
  }, [count, seed])

  return (
    <div className="blobs" aria-hidden="true">
      {blobs.map((b, i) => (
        <div
          key={i}
          className="blob"
          style={{
            left:       `${b.x}%`,
            top:        `${b.y}%`,
            width:      b.size,
            height:     b.size,
            background: b.blue
              ? `rgba(190,227,245,${b.opacity.toFixed(2)})`
              : `rgba(252,195,195,${b.opacity.toFixed(2)})`,
          }}
        />
      ))}
    </div>
  )
}

// ── Ticker ───────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'Attention is all you need (allegedly)', '·',
  'GPT-2 from scratch because why not', '·', 'Context windows stress me out', '·',
  'Multi-agent chaos engineer', '·', 'Shipping before it\'s ready since forever', '·',
  'NLP refresher arc', '·', 'Still reading that paper', '·',
  'Intelligence is just vibes', '·', 'Let\'s cook something', '·',
  'Systems that don\'t collapse', '·', 'Human in the loop (barely)', '·',
  'Pickle in the jar when it comes to pickleball', '·',
]

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="ticker" aria-hidden="true">
      <span className="ticker__inner">
        {doubled.map((item, i) => (
          <span className="ticker__item" key={i}>{item}</span>
        ))}
      </span>
    </div>
  )
}

// ── Nav ──────────────────────────────────────────────────────────────────────

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Nav() {
  return (
    <nav className="nav">
      <div className="nav__inner">
        <button className="nav__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BH</button>
        <ul className="nav__links">
          <li><button className="nav__link" onClick={() => scrollTo('now')}>now</button></li>
          <li><button className="nav__link" onClick={() => scrollTo('projects')}>projects</button></li>
          <li><button className="nav__link" onClick={() => scrollTo('resume')}>resume</button></li>
          <li><button className="nav__link" onClick={() => scrollTo('writing')}>writing</button></li>
          <li><button className="nav__link" onClick={() => scrollTo('startups')}>ideas</button></li>
        </ul>
      </div>
    </nav>
  )
}

export default function Info() {
  useEffect(() => {
    const onScroll = () => {
      document.documentElement.style.setProperty('--scroll-y', window.scrollY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <ScrollProgress />
      <Ticker />
      <Nav />
      <main>
        <HeroSection />
        <WhoIAmSection />
        <NowSection />
        <ProjectsSection />
        <ResumeSection />
        <PenAndPaperSection />
        <StartupsSection />
      </main>
      <FooterGame />
    </>
  )
}

// ── Section 1: Hero ──────────────────────────────────────────────────────────

function HeroSection() {
  const [ref, revealed] = useScrollReveal()
  return (
    <section className="section section--white">
      <Blobs count={8} seed={1} />
      <div className={`section__content ${revealed ? 'revealed' : ''}`} ref={ref}>
        <div className="kicker">
          <span className="kicker__dot" />
          engineer exploring intelligence, systems, and humans
        </div>
        <div className="avatar">BH</div>
        <h1 className="headline">Hi, I'm<br /><span className="headline-gradient">Blessy.</span></h1>
        <p className="subtext">
          I build things. I break things. I google why things broke. I fix it
          in a forever loop. Occasionally in that order.
        </p>
      </div>
      <span className="section__watermark" aria-hidden="true">BLESSY</span>
    </section>
  )
}

// ── Section 3: Now ───────────────────────────────────────────────────────────

const NOW = [
  {
    label: 'studying',
    text: 'Revising NLP with Stanford CME295 as a refresher. Going back to basics on purpose.',
    url: 'https://cme295.stanford.edu/',
  },
  {
    label: 'building',
    text: 'Multi-agent systems that don\'t fall apart when you look at them wrong.',
    url: null,
  },
  {
    label: 'questioning',
    text: 'How much of "intelligence" is just very well-compressed pattern matching.',
    url: null,
  },
  {
    label: 'on the courts',
    text: 'Pickling in pickleball courts.',
    url: null,
  },
]

function NowSection() {
  const [ref, revealed] = useScrollReveal()
  return (
    <section className="section section--white now-section" id="now">
      <Blobs count={4} seed={9} />
      <div className={`section__content ${revealed ? 'revealed' : ''}`} ref={ref}>
        <span className="eyebrow">what I'm up to</span>
        <h2 className="headline">now.</h2>
        <ul className="now-list">
          {NOW.map((item, i) => (
            <li className="now-item" key={i}>
              <span className="now-item__label">{item.label}</span>
              <p className="now-item__text">
                {item.text}
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="now-item__link">↗</a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <span className="section__watermark" aria-hidden="true">NOW</span>
    </section>
  )
}

// ── Stub placeholders for sections not yet implemented ───────────────────────

function WhoIAmSection()    { return <section id="about" /> }
function ProjectsSection()  { return <section id="projects" /> }
function StartupsSection()  { return <section id="startups" /> }
function ResumeSection()    { return <section id="resume" /> }
function PenAndPaperSection() { return <section id="writing" /> }
function FooterGame()       { return <footer /> }
