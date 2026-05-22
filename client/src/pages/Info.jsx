import { useState, useEffect, useRef, useMemo } from 'react'
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
      const size    = 160 + next() * 200   // 160–360 px
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
  'builder', '·', 'researcher', '·', 'multi-agent systems', '·',
  'context windows', '·', 'GPT-2 from scratch', '·', 'ships at 3am', '·',
  'ML papers', '·', "let's cook", '·',
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

function Nav() {
  return (
    <nav className="nav">
      <div className="nav__inner">
        <a href="#" className="nav__logo">BH</a>
        <ul className="nav__links">
          <li><a href="#projects" className="nav__link">projects</a></li>
          <li><a href="#startups" className="nav__link">startups</a></li>
          <li><a href="#writing" className="nav__link">writing</a></li>
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
        <ProjectsSection />
        <StartupsSection />
        <PenAndPaperSection />
      </main>
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
          yes, I am a real person
        </div>
        <div className="avatar">BH</div>
        <h1 className="headline">Hi, I'm<br /><span className="headline-gradient">Blessy.</span></h1>
        <p className="subtext">
          I build things. I break things. I google why things broke.
          Occasionally in that order.
        </p>
      </div>
      <span className="section__watermark" aria-hidden="true">BLESSY</span>
    </section>
  )
}

// ── Section 2: Who I Am ──────────────────────────────────────────────────────

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
        <h2 className="headline">who <span className="headline-gradient">I am.</span></h2>

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

// ── Section 3: Projects ──────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 'gpt2',
    title: 'GPT-2 from scratch',
    desc: 'read the paper. built the thing. understood 60% of it.',
    tech: ['Python', 'PyTorch'],
    badge: 'nobody asked',
    longest: false,
  },
  {
    id: 'saas',
    title: 'Multi-agent SaaS',
    desc: 'agents talking to agents. what could go wrong.',
    tech: ['Claude API', 'Node.js', 'React'],
    badge: 'built at 2am',
    longest: false,
  },
  {
    id: 'research',
    title: 'Context window research',
    desc: 'turns out more context = more chaos. documenting it.',
    tech: ['Python', 'Analysis'],
    badge: "jury's still out",
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

// ── Section 4: Startups + Let's Cook ────────────────────────────────────────

const STARTUPS = [
  {
    name: 'Uber for Therapists',
    tagline: 'on-demand emotional support. surge pricing during breakups.',
    reason: "the therapists needed therapy after.",
  },
  {
    name: 'PrivacyGram',
    tagline: "social network where nobody can see your posts.",
    reason: "turns out that's just a notes app.",
  },
  {
    name: 'DeepSleep AI',
    tagline: 'AI that optimises your sleep by judging your bedtime.',
    reason: 'it was too mean. people cried.',
  },
]

const PITCHES = [
  {
    pitch: 'Airbnb for coworking spaces. B2B. Series A ready.',
    fund: 'bold. probably wrong.',
    pass: 'wise, honestly.',
  },
  {
    pitch: "AI that tells you when you're being boring in meetings.",
    fund: 'disruptive. possibly illegal.',
    pass: '...you may be the target market.',
  },
  {
    pitch: "Spotify for studying. Yes it exists. No that doesn't matter.",
    fund: 'respect the delusion.',
    pass: 'at least you know.',
  },
  {
    pitch: 'A startup that rates other startups. Recursive disruption.',
    fund: 'this is peak Silicon Valley.',
    pass: 'probably the correct call.',
  },
]

const IDEA_COMMENTS = [
  'bold.',
  "someone's already doing this but go off.",
  "i like where your head's at.",
  "controversial. I'm in.",
  'adding this to my personality.',
]

function StartupsSection() {
  const [ref, revealed] = useScrollReveal()
  const [pitchIdx, setPitchIdx] = useState(0)
  const [pitchReaction, setPitchReaction] = useState('')
  const [ideas, setIdeas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('blessy-ideas') || '[]') } catch { return [] }
  })
  const [ideaInput, setIdeaInput] = useState('')
  const [ideaComment, setIdeaComment] = useState('')
  const [excited, setExcited] = useState(false)

  function handlePitch(choice) {
    const current = PITCHES[pitchIdx]
    setPitchReaction(choice === 'fund' ? current.fund : current.pass)
    setTimeout(() => {
      setPitchIdx(i => (i + 1) % PITCHES.length)
      setPitchReaction('')
    }, 1400)
  }

  function addIdea() {
    const trimmed = ideaInput.trim()
    if (!trimmed) return
    const next = [...ideas, trimmed]
    setIdeas(next)
    localStorage.setItem('blessy-ideas', JSON.stringify(next))
    setIdeaInput('')
    setIdeaComment(IDEA_COMMENTS[Math.floor(Math.random() * IDEA_COMMENTS.length)])
    setExcited(true)
    setTimeout(() => setIdeaComment(''), 2000)
  }

  function removeIdea(i) {
    const next = ideas.filter((_, idx) => idx !== i)
    setIdeas(next)
    localStorage.setItem('blessy-ideas', JSON.stringify(next))
    if (next.length === 0) setExcited(false)
  }

  return (
    <section className="section section--gray" id="startups">
      <Blobs count={8} seed={4} />
      <div className={`section__content ${revealed ? 'revealed' : ''}`} ref={ref}>

        <span className="eyebrow">ideas that were definitely going to change the world. briefly.</span>
        <h2 className="headline">
          almost
          <sup style={{ color: 'var(--purple)', fontSize: 16, display: 'inline-block', transform: 'rotate(12deg)', marginLeft: 2 }}>^</sup>
          {' '}startups
        </h2>

        <div className="startup-cards">
          {STARTUPS.map((s, i) => (
            <div className="card startup-card" key={i}>
              <h3 style={{ fontSize: 17, fontWeight: 400, marginBottom: 6 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{s.tagline}</p>
              <div className="startup-card__reason">
                <span className="startup-card__reason-tag">why it didn't happen</span>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{s.reason}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="game">
          <p className="game__question">{PITCHES[pitchIdx].pitch}</p>
          <div className="game__buttons">
            <button className="game__btn" onClick={() => handlePitch('fund')}>fund it</button>
            <button className="game__btn" onClick={() => handlePitch('pass')}>pass</button>
          </div>
          <p className="game__reaction">{pitchReaction}</p>
        </div>

        <div className="divider" />
        <div className="lmk-block">
        <span className="eyebrow">got an idea?</span>
        <h2 className="headline"><span className="headline-gradient">lmk.</span></h2>
        <p className="subtext">
          always looking for the next thing to build.
          drop an idea here — if something clicks, we can cook something together.
        </p>
        <p>
          Blessy will find these here. no promises. but also... maybe promises.
        </p>

        <svg
          className={`cartoon ${excited ? 'excited' : ''}`}
          width="120" height="130"
          viewBox="0 0 120 130"
        >
          <circle cx="60" cy="22" r="16" fill="var(--pink)" />
          <g className="face-neutral">
            <circle cx="54" cy="19" r="2" fill="var(--ink)" />
            <circle cx="66" cy="19" r="2" fill="var(--ink)" />
            <line x1="54" y1="27" x2="66" y2="27" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <g className="face-excited">
            <circle cx="54" cy="19" r="2" fill="var(--ink)" />
            <circle cx="66" cy="19" r="2" fill="var(--ink)" />
            <path d="M54 25 Q60 31 66 25" stroke="var(--ink)" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <line x1="60" y1="38" x2="60" y2="74" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="50" x2="38" y2="64" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="50" x2="82" y2="60" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="74" x2="46" y2="100" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="74" x2="74" y2="100" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          <rect x="22" y="62" width="18" height="14" rx="3" fill="var(--pink)" stroke="var(--ink)" strokeWidth="1" />
          <rect x="5" y="108" width="110" height="6" rx="2" fill="var(--blue)" opacity="0.25" />
        </svg>

        <div className="idea-input-row">
          <input
            className="idea-input"
            type="text"
            placeholder="drop an idea..."
            value={ideaInput}
            onChange={e => setIdeaInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addIdea()}
          />
          <button className="idea-add-btn" onClick={addIdea}>add</button>
        </div>
        <p className="idea-comment">{ideaComment}</p>

        {ideas.length > 0 && (
          <ul className="idea-list">
            {ideas.map((idea, i) => (
              <li className="idea-item" key={i}>
                <span>{idea}</span>
                <button className="idea-remove" onClick={() => removeIdea(i)} aria-label="remove idea">×</button>
              </li>
            ))}
          </ul>
        )}

        </div>{/* end lmk-block */}
      </div>
      <span className="section__watermark" aria-hidden="true">IDEAS</span>
    </section>
  )
}

// ── Section 5: Pen & Paper ───────────────────────────────────────────────────

const WRITINGS = [
  {
    id: 'gpt2-blog',
    type: 'blog',
    title: 'Why I built GPT-2 from scratch',
    subtitle: 'nobody asked. zero regrets.',
    status: 'published',
    url: '#',
    desc: 'A walkthrough of implementing the full GPT-2 architecture from scratch — attention heads, positional encodings, and the bits papers gloss over.',
  },
  {
    id: 'context-blog',
    type: 'blog',
    title: 'Context windows and why they stress me out',
    subtitle: 'more tokens ≠ more intelligence. groundbreaking.',
    status: 'coming-soon',
    url: null,
    desc: 'An honest look at what happens to LLM coherence as you push context to its limits.',
  },
  {
    id: 'multiagent-blog',
    type: 'blog',
    title: 'Multi-agent systems — a love/chaos story',
    subtitle: 'what happens when you let AI talk to itself.',
    status: 'coming-soon',
    url: null,
    desc: 'Building a multi-agent SaaS and discovering every failure mode the papers skip.',
  },
  {
    id: 'framework-blog',
    type: 'blog',
    title: 'Why I question every framework I use',
    subtitle: 'finite things deserve infinite scrutiny.',
    status: 'coming-soon',
    url: null,
    desc: "Abstractions have tradeoffs. This is about knowing which ones you're signing up for.",
  },
  {
    id: 'context-preprint',
    type: 'preprint',
    title: 'Context Window Complexity in Multi-Agent LLM Systems',
    subtitle: 'turns out Big-O applies to vibes too.',
    status: 'in-progress',
    url: null,
    desc: 'Formal analysis of how context window usage scales in multi-agent architectures and what that means for coherence.',
  },
]

function PenAndPaperSection() {
  const [ref, revealed] = useScrollReveal()
  const [paperState, setPaperState] = useState('folded')
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(new Set())

  useEffect(() => {
    if (!revealed) return
    const t1 = setTimeout(() => setPaperState('unfolding'), 200)
    const t2 = setTimeout(() => setPaperState('unfolded'), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [revealed])

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = WRITINGS.filter(w => {
    if (filter === 'Blog') return w.type === 'blog'
    if (filter === 'Pre-print') return w.type === 'preprint'
    return true
  })

  return (
    <section className="section section--white" id="writing">
      <Blobs count={8} seed={5} />
      <div className={`section__content ${revealed ? 'revealed' : ''}`} ref={ref}>
        <span className="eyebrow">pen & paper</span>
        <h2 className="headline">things I <span className="headline-gradient">wrote.</span></h2>
        <p className="subtext">
          blogs, pre-prints, half-baked thoughts. occasionally coherent.
        </p>

        <div className={`paper-card ${paperState}`}>
          <div className="filter-pills">
            {['All', 'Blog', 'Pre-print'].map(f => (
              <button
                key={f}
                className={`filter-pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="writing-list">
            {filtered.map(w => (
              <div
                className="writing-row"
                key={w.id}
                onClick={() => toggleExpand(w.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleExpand(w.id)}
              >
                <div className="writing-row__header">
                  <span className={`type-pill ${w.type === 'blog' ? 'type-pill--blog' : 'type-pill--preprint'}`}>
                    {w.type === 'blog' ? 'blog' : 'pre-print'}
                  </span>
                  <span className="writing-row__title">{w.title}</span>
                  <span className={`status-pill status-pill--${w.status}`}>
                    {w.status === 'coming-soon' ? 'coming soon'
                      : w.status === 'in-progress' ? 'in progress'
                      : w.status}
                  </span>
                  {w.url && (
                    <a
                      href={w.url}
                      style={{ color: 'var(--blue)', fontSize: 16, marginLeft: 4 }}
                      onClick={e => e.stopPropagation()}
                      aria-label={`Open ${w.title}`}
                    >
                      ↗
                    </a>
                  )}
                </div>
                <p className="writing-row__subtitle">{w.subtitle}</p>
                <div className={`writing-expand ${expanded.has(w.id) ? 'open' : ''}`}>
                  {w.desc}
                </div>
              </div>
            ))}
          </div>

          <Link to="/pen-and-paper" className="see-all">see all writing →</Link>
        </div>
      </div>
      <span className="section__watermark" aria-hidden="true">WROTE</span>
    </section>
  )
}
