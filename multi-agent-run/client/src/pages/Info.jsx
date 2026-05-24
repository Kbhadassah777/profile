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

const FACTS = [
  {
    fact: 'I have shipped production code at 3am.',
    answer: true,
    sarcasm: "the server didn't care about my sleep schedule.",
  },
  {
    fact: 'I have read an entire ML paper for fun.',
    answer: true,
    sarcasm: 'voluntarily. no one asked.',
  },
  {
    fact: 'I prefer tabs over spaces.',
    answer: false,
    sarcasm: 'obviously spaces. obviously.',
  },
]

function WhoIAmSection() {
  const [ref, revealed] = useScrollReveal()
  const [idx, setIdx] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [reaction, setReaction] = useState('')

  function handleAnswer(choice) {
    if (answered !== null) return
    const isRight = choice === FACTS[idx].answer
    setAnswered(choice)
    setReaction(
      isRight
        ? `correct. ${FACTS[idx].sarcasm}`
        : `wrong. ${FACTS[idx].sarcasm}`
    )
    setTimeout(() => {
      setIdx(i => (i + 1) % FACTS.length)
      setAnswered(null)
      setReaction('')
    }, 1200)
  }

  return (
    <section className="section section--gray">
      <Blobs count={8} seed={2} />
      <div className={`section__content ${revealed ? 'revealed' : ''}`} ref={ref}>
        <span className="eyebrow">a few things about me</span>
        <h2 className="headline">who am <span className="headline-gradient">I?</span></h2>

        <div className="fact-cards">
          {FACTS.map((f, i) => (
            <div className="card" key={i} style={{ '--i': i }}>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 8 }}>{f.fact}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{f.sarcasm}</p>
            </div>
          ))}
        </div>

        <div className="game">
          <p className="game__question">{FACTS[idx].fact}</p>
          <div className="game__buttons">
            <button
              className={`game__btn ${answered === true ? 'game__btn--purple' : ''}`}
              onClick={() => handleAnswer(true)}
            >
              True
            </button>
            <button
              className={`game__btn ${answered === false ? 'game__btn--purple' : ''}`}
              onClick={() => handleAnswer(false)}
            >
              False
            </button>
          </div>
          <p className="game__reaction">{reaction}</p>
        </div>
      </div>
      <span className="section__watermark" aria-hidden="true">FACTS</span>
    </section>
  )
}

const PROJECTS = [
  {
    id: 'gpt2',
    title: 'GPT-2 from Scratch',
    desc: 'studied the OpenAI paper + Karpathy\'s nanoGPT. built tokenisation, positional embeddings, attention heads from scratch. trained on sample corpora for text generation.',
    tech: ['Python', 'PyTorch', 'Transformers'],
    badge: 'nobody asked',
    longest: false,
  },
  {
    id: 'sde-agent',
    title: 'Senior SDE Agent',
    desc: 'multi-agent master-slave architecture with Claude Opus 4.5. token optimisation, task delivery, feedback loops, and hallucination mitigation via context health checks.',
    tech: ['Claude Opus 4.5', 'Multi-Agent', 'Node.js'],
    badge: 'in progress',
    longest: true,
  },
  {
    id: 'chatbot',
    title: 'Healthcare Chatbot',
    desc: 'scraped top 100 google results, fine-tuned a HuggingFace model, hosted on AWS SageMaker with a REST API. accuracy: 0.83.',
    tech: ['Python', 'SentenceBert', 'Selenium', 'AWS'],
    badge: '0.83 acc',
    longest: false,
  },
  {
    id: 'malicious-login',
    title: 'Malicious Login Detector',
    desc: 'validates login attempts in real time. trained on KDD dataset, served via AWS SageMaker REST API. accuracy: 0.96.',
    tech: ['Python', 'sklearn', 'AWS SageMaker'],
    badge: '0.96 acc',
    longest: false,
  },
  {
    id: 'saas',
    title: 'Multi-agent SaaS',
    desc: 'agents talking to agents. what could go wrong. building the infra to find out.',
    tech: ['Claude API', 'Node.js', 'React'],
    badge: 'in progress',
    longest: true,
  },
]

function ProjectsSection() {
  const [ref, revealed] = useScrollReveal()
  const [picked, setPicked] = useState(null)
  const [reaction, setReaction] = useState('')

  function handlePick(project) {
    if (picked) return
    setPicked(project.id)
    setReaction(
      project.longest
        ? 'unfortunately correct. research never ends.'
        : 'bold guess. wrong though.'
    )
  }

  return (
    <section className="section section--white" id="projects">
      <Blobs count={8} seed={3} />
      <div className={`section__content ${revealed ? 'revealed' : ''}`} ref={ref}>
        <span className="eyebrow">things I built</span>

        <div className="card-grid">
          {PROJECTS.map((p, i) => (
            <div className="card card--hover" key={p.id} style={{ '--i': i }}>
              <span className="badge">{p.badge}</span>
              <h3 style={{ fontSize: 18, fontWeight: 400, marginBottom: 8, paddingRight: 80 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{p.desc}</p>
              <div className="tech-tags">
                {p.tech.map(t => <span className="tech-tag" key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div className="game">
          <p className="game__question">which one took the longest?</p>
          <div className="game__buttons">
            {PROJECTS.map(p => (
              <button
                key={p.id}
                className={`game__btn ${picked === p.id ? 'game__btn--purple' : ''}`}
                onClick={() => handlePick(p)}
              >
                {p.title}
              </button>
            ))}
          </div>
          <p className="game__reaction">{reaction}</p>
        </div>
      </div>
      <span className="section__watermark" aria-hidden="true">BUILT</span>
    </section>
  )
}
function StartupsSection()  { return <section id="startups" /> }
function ResumeSection()    { return <section id="resume" /> }
function PenAndPaperSection() { return <section id="writing" /> }
function FooterGame()       { return <footer /> }
