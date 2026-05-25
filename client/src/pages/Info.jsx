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
    // LCG deterministic RNG : same seed always produces the same layout
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

// ── Section 4: Projects ──────────────────────────────────────────────────────

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


function StartupsSection() {
  const [ref, revealed] = useScrollReveal()
  const [pitchIdx, setPitchIdx] = useState(0)
  const [pitchReaction, setPitchReaction] = useState('')
  const [excited, setExcited] = useState(false)
  const [lmkIdea, setLmkIdea]   = useState('')
  const [lmkName, setLmkName]   = useState('')
  const [lmkEmail, setLmkEmail] = useState('')
  const [lmkState, setLmkState] = useState('idle') // idle | sending | sent | error

  function handlePitch(choice) {
    const current = PITCHES[pitchIdx]
    setPitchReaction(choice === 'fund' ? current.fund : current.pass)
    setTimeout(() => {
      setPitchIdx(i => (i + 1) % PITCHES.length)
      setPitchReaction('')
    }, 1400)
  }

  async function submitLmk(e) {
    e.preventDefault()
    if (!lmkIdea.trim()) return
    setLmkState('sending')
    setExcited(true)
    try {
      const res = await fetch('https://formspree.io/f/mbdbkeyo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          idea: lmkIdea,
          name: lmkName || 'anonymous',
          _replyto: lmkEmail || '',
        }),
      })
      setLmkState(res.ok ? 'sent' : 'error')
    } catch {
      setLmkState('error')
    }
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
        <span className="eyebrow">currently out grocery shopping (for ideas)</span>
        <h2 className="headline">do you want me to<br /><span className="headline-gradient">add something?</span></h2>
        <p className="subtext">
          Drop it on the list. I'll find it when I'm back.
        </p>
        <p>
          I'll get it for the both of us and we can cook it together!
        </p>

        <svg
          className={`cartoon ${excited ? 'excited' : ''}`}
          width="160" height="130"
          viewBox="0 0 160 130"
          aria-hidden="true"
        >
          {/* ── person ── */}
          {/* head */}
          <circle cx="38" cy="22" r="14" fill="var(--pink)" stroke="var(--ink)" strokeWidth="1" />
          <g className="face-neutral">
            <circle cx="33" cy="20" r="1.8" fill="var(--ink)" />
            <circle cx="43" cy="20" r="1.8" fill="var(--ink)" />
            <line x1="33" y1="27" x2="43" y2="27" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <g className="face-excited">
            <circle cx="33" cy="20" r="1.8" fill="var(--ink)" />
            <circle cx="43" cy="20" r="1.8" fill="var(--ink)" />
            <path d="M33 25 Q38 31 43 25" stroke="var(--ink)" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          {/* body */}
          <line x1="38" y1="36" x2="38" y2="72" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          {/* right arm : forward, gripping cart handle */}
          <line x1="38" y1="48" x2="70" y2="58" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          {/* left arm : back swing */}
          <line x1="38" y1="48" x2="20" y2="62" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          {/* walking legs */}
          <g className="leg-left">
            <line x1="38" y1="72" x2="26" y2="100" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="leg-right">
            <line x1="38" y1="72" x2="50" y2="98" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* ── shopping cart ── */}
          {/* handle bar */}
          <line x1="70" y1="58" x2="110" y2="58" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
          {/* cart frame sides */}
          <line x1="75" y1="58" x2="80" y2="90" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="110" y1="58" x2="115" y2="90" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
          {/* cart basket */}
          <rect x="78" y="62" width="38" height="28" rx="3" fill="var(--blue)" stroke="var(--ink)" strokeWidth="1.5" opacity="0.85" />
          {/* basket grid lines */}
          <line x1="91" y1="62" x2="91" y2="90" stroke="var(--ink)" strokeWidth="0.7" opacity="0.4" />
          <line x1="104" y1="62" x2="104" y2="90" stroke="var(--ink)" strokeWidth="0.7" opacity="0.4" />
          <line x1="78" y1="73" x2="116" y2="73" stroke="var(--ink)" strokeWidth="0.7" opacity="0.4" />
          {/* items poking out */}
          <circle cx="88" cy="59" r="5" fill="var(--pink)" stroke="var(--ink)" strokeWidth="0.9" />
          <circle cx="100" cy="57" r="4.5" fill="#8BC34A" stroke="var(--ink)" strokeWidth="0.9" />
          <rect x="108" y="54" width="5" height="10" rx="1.5" fill="var(--pink)" opacity="0.9" />
          {/* cart bottom bar */}
          <line x1="78" y1="90" x2="116" y2="90" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
          {/* axle */}
          <line x1="82" y1="90" x2="112" y2="90" stroke="var(--ink)" strokeWidth="1" />
          {/* wheels */}
          <circle cx="84" cy="100" r="9" fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="84" cy="100" r="4" fill="var(--ink)" opacity="0.12" />
          <circle cx="110" cy="100" r="9" fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.5" />
          <circle cx="110" cy="100" r="4" fill="var(--ink)" opacity="0.12" />
          {/* wheel spokes */}
          <line x1="84" y1="91" x2="84" y2="109" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
          <line x1="75" y1="100" x2="93" y2="100" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
          <line x1="110" y1="91" x2="110" y2="109" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />
          <line x1="101" y1="100" x2="119" y2="100" stroke="var(--ink)" strokeWidth="0.8" opacity="0.3" />

          {/* ground shadow */}
          <ellipse cx="80" cy="116" rx="70" ry="4" fill="var(--blue)" opacity="0.15" />
        </svg>

        {lmkState === 'sent' ? (
          <div className="lmk-success">
            <p className="lmk-success__msg">Got it. I'll look for the aisle it is in NOW!!!!</p>
            <button className="lmk-success__reset" onClick={() => { setLmkIdea(''); setLmkName(''); setLmkEmail(''); setLmkState('idle'); setExcited(false) }}>
              drop another idea
            </button>
          </div>
        ) : (
          <form className="lmk-form" onSubmit={submitLmk}>
            <input
              className="idea-input"
              type="text"
              placeholder="the idea..."
              value={lmkIdea}
              onChange={e => setLmkIdea(e.target.value)}
              required
            />
            <div className="lmk-contact-row">
              <input
                className="idea-input"
                type="text"
                placeholder="your name (optional)"
                value={lmkName}
                onChange={e => setLmkName(e.target.value)}
              />
              <input
                className="idea-input"
                type="email"
                placeholder="your email (optional)"
                value={lmkEmail}
                onChange={e => setLmkEmail(e.target.value)}
              />
            </div>
            {lmkState === 'error' && (
              <p className="lmk-error">something went wrong. try again?</p>
            )}
            <button className="idea-add-btn" type="submit" disabled={lmkState === 'sending'}>
              {lmkState === 'sending' ? 'sending...' : 'send it'}
            </button>
          </form>
        )}

        </div>{/* end lmk-block */}
      </div>
      <span className="section__watermark" aria-hidden="true">IDEAS</span>
    </section>
  )
}

// ── Section 5: Resume ────────────────────────────────────────────────────────

const EXPERIENCE = [
  {
    id: 'qualcomm',
    org: 'Qualcomm',
    role: 'Engineer',
    period: 'Jun 2025 – present',
    points: [
      'Building a CI platform that orchestrates and executes jobs on requested resources using Jenkins pipelines.',
      'Solely architected and maintains the Context Service & CLI (Node.js + MongoDB) for runtime context accessibility.',
      'Built a Template Service (à la GitHub Actions) and enhanced job orchestration.',
      'Designed a web crawler for automated AWS Parameter Store access.',
    ],
  },
  {
    id: 'stax',
    org: 'Stax.AI',
    role: 'Software Engineer',
    period: '2024 – Jun 2025',
    points: [
      'Built a job orchestrator using PostgreSQL and RabbitMQ with retries, DLQs, and multi-cloud scaling.',
      'Designed an OCR + GPT-3.5 pipeline with prompt chaining and fuzzy logic for large-scale document verification.',
      'Developed a file sync interface (React + Node.js + AWS S3 / IAM) used by 70% of customers.',
      'Migrated services to GCP Cloud Functions and Compute Engine.',
    ],
  },
  {
    id: 'jio',
    org: 'Reliance Jio',
    role: 'Software Developer',
    period: 'Aug 2020 – Nov 2021',
    points: [
      'Built indoor tracking device application with Java, MySQL, and Spring Boot.',
      'Spring Boot microservice to monitor out-of-zone tags, improved location accuracy by 30%.',
      'Optimised DB by indexing tables: 20% reduction in response time; simplified queries with Oracle views.',
      'Streamlined CI/CD deployment in Azure DevOps across multiple teams.',
    ],
  },
]

const EDUCATION = [
  {
    id: 'asu',
    org: 'Arizona State University',
    degree: 'M.S. Computer Science',
    period: 'Jan 2022 – Dec 2023',
    gpa: '3.94 / 4.0',
    detail: 'Distributed Database Systems · Software Security · HCI · Data Mining · Statistical ML · Planning & Learning in AI · Semantic Web Mining',
  },
  {
    id: 'vit',
    org: 'Vellore Institute of Technology',
    degree: 'B.Tech Electronics & Comm. Engineering',
    period: 'Jul 2016 – Jun 2020',
    gpa: '3.26 / 4.0',
    detail: 'Minor: IoT & Sensors · OOP · DSA · Cloud Computing · Neural Networks · AI with Python',
  },
]

const CERTIFICATIONS = [
  'AWS Cloud Practitioner',
  'Azure Database Administrator Associate',
  'Azure Data Fundamentals',
]

function ResumeSection() {
  const [ref, revealed] = useScrollReveal()
  const [openExp, setOpenExp] = useState(null)

  return (
    <section className="section section--gray" id="resume">
      <Blobs count={6} seed={9} />
      <div className={`section__content ${revealed ? 'revealed' : ''}`} ref={ref}>
        <span className="eyebrow">résumé</span>
        <h2 className="headline">the <span className="headline-gradient">full picture.</span></h2>

        {/* Experience */}
        <div className="resume-block">
          <h3 className="resume-block__label">Experience</h3>
          <div className="resume-timeline">
            {EXPERIENCE.map(e => (
              <div key={e.id} className="resume-item">
                <div
                  className="resume-item__header"
                  onClick={() => setOpenExp(openExp === e.id ? null : e.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={ev => (ev.key === 'Enter' || ev.key === ' ') && setOpenExp(openExp === e.id ? null : e.id)}
                >
                  <div className="resume-item__left">
                    <span className="resume-item__org">{e.org}</span>
                    <span className="resume-item__role">{e.role}</span>
                  </div>
                  <div className="resume-item__right">
                    <span className="resume-item__period">{e.period}</span>
                    <span className="resume-item__toggle">{openExp === e.id ? '−' : '+'}</span>
                  </div>
                </div>
                {openExp === e.id && (
                  <ul className="resume-item__points">
                    {e.points.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="resume-block">
          <h3 className="resume-block__label">Education</h3>
          <div className="resume-edu-grid">
            {EDUCATION.map(ed => (
              <div key={ed.id} className="resume-edu-card card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <span className="resume-edu-card__org">{ed.org}</span>
                  <span className="pill pill--blue" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{ed.gpa}</span>
                </div>
                <p className="resume-edu-card__degree">{ed.degree}</p>
                <p className="resume-edu-card__period">{ed.period}</p>
                <p className="resume-edu-card__detail">{ed.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="resume-block">
          <h3 className="resume-block__label">Certifications</h3>
          <div className="resume-certs">
            {CERTIFICATIONS.map(c => (
              <span key={c} className="resume-cert">{c}</span>
            ))}
          </div>
        </div>
      </div>
      <span className="section__watermark" aria-hidden="true">CV</span>
    </section>
  )
}

// ── Section 6: Pen & Paper ───────────────────────────────────────────────────
import { WRITINGS } from '../data/writings/index.js'

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
            {filtered.map(w => {
              const isPublished = w.status === 'published'
              return (
                <div
                  key={w.id}
                  className="writing-row"
                  onClick={() => isPublished ? null : toggleExpand(w.id)}
                  role={isPublished ? undefined : 'button'}
                  tabIndex={0}
                  onKeyDown={e => !isPublished && (e.key === 'Enter' || e.key === ' ') && toggleExpand(w.id)}
                >
                  {isPublished
                    ? (
                      <Link to={`/blog/${w.id}`} className="writing-row__link-wrap">
                        <div className="writing-row__header">
                          <span className="type-pill type-pill--blog">blog</span>
                          <div className="writing-row__main">
                            <span className="writing-row__title">{w.title}</span>
                            <p className="writing-row__subtitle">{w.subtitle}</p>
                          </div>
                          <span className="status-pill status-pill--published">published</span>
                          <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 4 }}>→</span>
                        </div>
                      </Link>
                    )
                    : (
                      <>
                        <div className="writing-row__header">
                          <span className={`type-pill ${w.type === 'blog' ? 'type-pill--blog' : 'type-pill--preprint'}`}>
                            {w.type === 'blog' ? 'blog' : 'pre-print'}
                          </span>
                          <div className="writing-row__main">
                            <span className="writing-row__title">{w.title}</span>
                            <p className="writing-row__subtitle">{w.subtitle}</p>
                          </div>
                          <span className={`status-pill status-pill--${w.status}`}>
                            {w.status === 'coming-soon' ? 'coming soon' : 'in progress'}
                          </span>
                        </div>
                        <div className={`writing-expand ${expanded.has(w.id) ? 'open' : ''}`}>
                          {w.desc}
                        </div>
                      </>
                    )}
                </div>
              )
            })}
          </div>

          <Link to="/blog" className="see-all">see all writing →</Link>
        </div>
      </div>
      <span className="section__watermark" aria-hidden="true">WROTE</span>
    </section>
  )
}

// ── Footer / Runner Game ─────────────────────────────────────────────────────

function PandaIcon({ dead }) {
  return (
    <svg width="28" height="46" viewBox="0 0 28 46" fill="none" aria-hidden="true">
      {/* Ears */}
      <circle cx="7"  cy="7"  r="5.5" fill="#1D1D1F" />
      <circle cx="21" cy="7"  r="5.5" fill="#1D1D1F" />
      <circle cx="7"  cy="7"  r="2.8" fill="#2e2e2e" />
      <circle cx="21" cy="7"  r="2.8" fill="#2e2e2e" />
      {/* Head */}
      <circle cx="14" cy="16" r="11"  fill="#FAF8F4" />
      {/* Eye patches */}
      <ellipse cx="9.5"  cy="14.5" rx="3.8" ry="4.2" fill="#1D1D1F" />
      <ellipse cx="18.5" cy="14.5" rx="3.8" ry="4.2" fill="#1D1D1F" />
      {/* Eye whites */}
      <circle cx="9.5"  cy="14.5" r="2.2" fill="white" />
      <circle cx="18.5" cy="14.5" r="2.2" fill="white" />
      {dead ? (
        <>
          <line x1="8.2"  y1="13.2" x2="10.8" y2="15.8" stroke="#1D1D1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="10.8" y1="13.2" x2="8.2"  y2="15.8" stroke="#1D1D1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="17.2" y1="13.2" x2="19.8" y2="15.8" stroke="#1D1D1F" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="19.8" y1="13.2" x2="17.2" y2="15.8" stroke="#1D1D1F" strokeWidth="1.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="10"   cy="15"   r="1.2" fill="#1D1D1F" />
          <circle cx="19"   cy="15"   r="1.2" fill="#1D1D1F" />
          <circle cx="10.6" cy="14.4" r="0.6" fill="white" />
          <circle cx="19.6" cy="14.4" r="0.6" fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="14" cy="19.5" rx="1.8" ry="1.2" fill="#1D1D1F" />
      {/* Mouth */}
      {dead
        ? <path d="M11.5 23 Q14 21 16.5 23"   stroke="#1D1D1F" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        : <path d="M11.5 22.5 Q14 25 16.5 22.5" stroke="#1D1D1F" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      }
      {/* Blush */}
      <ellipse cx="4.5" cy="19" rx="2.6" ry="1.7" fill="#fcc3c3" opacity="0.75" />
      <ellipse cx="23.5" cy="19" rx="2.6" ry="1.7" fill="#fcc3c3" opacity="0.75" />
      {/* Body */}
      <ellipse cx="14" cy="33" rx="8.5" ry="8"   fill="#FAF8F4" />
      {/* Belly circle */}
      <ellipse cx="14" cy="33.5" rx="4.5" ry="4.5" fill="rgba(190,227,245,0.2)" />
      {/* Arms */}
      <ellipse cx="4"  cy="30" rx="3"   ry="2.2" fill="#1D1D1F" transform="rotate(-25 4 30)" />
      <ellipse cx="24" cy="30" rx="3"   ry="2.2" fill="#1D1D1F" transform="rotate(25 24 30)" />
      {/* Legs */}
      <ellipse cx="9.5"  cy="41.5" rx="4"   ry="3.2" fill="#1D1D1F" />
      <ellipse cx="18.5" cy="41.5" rx="4"   ry="3.2" fill="#1D1D1F" />
      {/* Paw pads */}
      <ellipse cx="9.5"  cy="43" rx="2" ry="1.2" fill="rgba(250,248,244,0.4)" />
      <ellipse cx="18.5" cy="43" rx="2" ry="1.2" fill="rgba(250,248,244,0.4)" />
    </svg>
  )
}

const DEATH_MSGS = [
  'walked into a cactus. very on brand.',
  'panda down. shareholders notified.',
  'fatal error: too many obstacles in life',
  'bh.exe has stopped working. have you tried turning her off and on again?',
  'rip 🐼 she was going places (into the obstacle)',
  'skill issue. respectfully.',
  'the obstacle was a metaphor. she still lost.',
]

function FooterGame() {
  const containerRef = useRef(null)
  const [gameState, setGameState] = useState('idle')
  const [score, setScore]         = useState(0)
  const [hiScore, setHiScore]     = useState(0)
  const [jumping, setJumping]     = useState(false)
  const [obstacles, setObstacles] = useState([])
  const [deathMsg, setDeathMsg]   = useState('')

  const g = useRef({
    obstacles: [], score: 0, speed: 200,
    timeSinceLast: 0, nextIn: 2000,
    raf: null, last: null,
    jumping: false, state: 'idle', gameW: 700,
  })

  const CHAR_X = 82, CHAR_W = 28, OBS_W = 14

  // Store loop in ref so RAF callback always has fresh access to g.current
  const loopRef = useRef(null)
  loopRef.current = (time) => {
    const c = g.current
    if (!c.last) c.last = time
    const dt = Math.min(time - c.last, 50)
    c.last = time

    c.obstacles = c.obstacles
      .map(o => ({ ...o, x: o.x - c.speed * dt / 1000 }))
      .filter(o => o.x > -(OBS_W + 10))

    c.timeSinceLast += dt
    if (c.timeSinceLast >= c.nextIn) {
      c.timeSinceLast = 0
      c.nextIn = 1500 + Math.random() * 1400
      c.obstacles.push({ id: time, x: c.gameW })
    }

    const hit = c.obstacles.some(o =>
      o.x < CHAR_X + CHAR_W && o.x + OBS_W > CHAR_X && !c.jumping
    )

    if (hit) {
      c.state = 'dead'
      setGameState('dead')
      setDeathMsg(DEATH_MSGS[Math.floor(Math.random() * DEATH_MSGS.length)])
      setHiScore(prev => Math.max(prev, Math.floor(c.score)))
      setObstacles([...c.obstacles])
      return
    }

    c.score += dt / 100
    c.speed = 200 + Math.floor(c.score / 50) * 15
    setScore(Math.floor(c.score))
    setObstacles([...c.obstacles])
    c.raf = requestAnimationFrame(loopRef.current)
  }

  const doJump = useCallback(() => {
    const c = g.current
    if (c.state !== 'playing' || c.jumping) return
    c.jumping = true
    setJumping(true)
    setTimeout(() => { c.jumping = false; setJumping(false) }, 520)
  }, [])

  const startGame = useCallback(() => {
    const c = g.current
    c.gameW = containerRef.current?.offsetWidth ?? 700
    Object.assign(c, {
      obstacles: [], score: 0, timeSinceLast: 0,
      nextIn: 2000, state: 'playing', last: null,
      speed: 200, jumping: false,
    })
    setGameState('playing')
    setScore(0)
    setJumping(false)
    setObstacles([])
    if (c.raf) cancelAnimationFrame(c.raf)
    c.raf = requestAnimationFrame(loopRef.current)
  }, [])

  useEffect(() => () => { if (g.current.raf) cancelAnimationFrame(g.current.raf) }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault()
        const c = g.current
        if (c.state === 'idle' || c.state === 'dead') startGame()
        else doJump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startGame, doJump])

  function handleTap() {
    const c = g.current
    if (c.state === 'idle' || c.state === 'dead') startGame()
    else doJump()
  }

  const padScore = (n) => String(n).padStart(5, '0')

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <span className="eyebrow">you found the bottom</span>
          <div className="footer__score-row">
            <span className="footer__score">
              {gameState === 'idle'    && 'space / tap to play'}
              {gameState === 'playing' && padScore(score)}
              {gameState === 'dead'    && `rip. ${padScore(score)}`}
            </span>
            {hiScore > 0 && (
              <span className="footer__hi">HI {padScore(hiScore)}</span>
            )}
          </div>
        </div>

        <div
          className="game-strip"
          ref={containerRef}
          onClick={handleTap}
          role="button"
          tabIndex={0}
          aria-label="runner mini game : press space or tap to jump"
          onKeyDown={e => { if (e.key === ' ') { e.preventDefault(); handleTap() } }}
        >
          <div className="game-strip__ground" />
          <div className="cloud cloud--1" aria-hidden="true" />
          <div className="cloud cloud--2" aria-hidden="true" />
          <div className="cloud cloud--3" aria-hidden="true" />

          <div className={`runner${jumping ? ' runner--jump' : ''}${gameState === 'dead' ? ' runner--dead' : ''}`}>
            <PandaIcon dead={gameState === 'dead'} />
          </div>

          {obstacles.map(o => (
            <div key={o.id} className="obstacle" style={{ left: Math.round(o.x) }} />
          ))}

          {(gameState === 'idle' || gameState === 'dead') && (
            <div className="game-strip__msg">
              {gameState === 'idle'
                ? 'bh is offline. tap to run'
                : <>{deathMsg}<br /><span style={{ opacity: 0.6 }}>tap to retry</span></>}
            </div>
          )}
        </div>

        <div className="footer__links">
          <a href="mailto:blessykonedana@gmail.com" className="footer__contact-link">email</a>
          <a href="https://www.linkedin.com/in/blessykonedana/" target="_blank" rel="noopener noreferrer" className="footer__contact-link">LinkedIn</a>
          <a href="https://github.com/Kbhadassah777" target="_blank" rel="noopener noreferrer" className="footer__contact-link">GitHub</a>
        </div>
        <div className="footer__meta">
          <span>© 2026 Blessy Hadassa Konedana</span>
          <span>made with too much coffee and one too many context windows</span>
        </div>
      </div>
    </footer>
  )
}
