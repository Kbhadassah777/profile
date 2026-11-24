import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import '../styles/tutor-copilot.css'

const NOTES_KEY = 'tc-board-notes'
let noteSeq = 0

function useBoardNotes() {
  const [notes, setNotes] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const boardRef = useRef(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
      if (Array.isArray(saved)) setNotes(saved)
    } catch { /* ignore corrupt storage */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  }, [notes, hydrated])

  const addNote = useCallback((e) => {
    if (e.target.closest('a, button, .tc-note, svg')) return
    const rect = boardRef.current.getBoundingClientRect()
    const id = `n${Date.now()}-${noteSeq++}`
    setNotes(prev => [...prev, {
      id,
      left: e.clientX - rect.left,
      top: e.clientY - rect.top,
      text: '',
    }])
    requestAnimationFrame(() => {
      document.getElementById(id)?.focus()
    })
  }, [])

  function updateNote(id, text) {
    const trimmed = text.trim()
    if (!trimmed) {
      setNotes(prev => prev.filter(n => n.id !== id))
      return
    }
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text: trimmed } : n))
  }

  function removeNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  return { notes, boardRef, addNote, updateNote, removeNote }
}

function BoardNotes({ notes, updateNote, removeNote }) {
  return (
    <>
      {notes.map(n => (
        <div key={n.id} className="tc-note" style={{ left: n.left, top: n.top }}>
          <button
            type="button"
            className="tc-note__close"
            aria-label="remove note"
            onClick={(e) => { e.stopPropagation(); removeNote(n.id) }}
          >
            &times;
          </button>
          <div
            id={n.id}
            className="tc-note__text"
            contentEditable
            suppressContentEditableWarning
            data-placeholder="jot a note..."
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => updateNote(n.id, e.currentTarget.textContent)}
          >
            {n.text}
          </div>
        </div>
      ))}
      {notes.length === 0 && (
        <div className="tc-note-hint" aria-hidden="true">click anywhere on the board to leave a note. it stays only in your browser</div>
      )}
    </>
  )
}

export default function TutorCopilotBoard() {
  const { notes, boardRef, addNote, updateNote, removeNote } = useBoardNotes()

  return (
    <div className="tc-page">
      <div className="tc-board" ref={boardRef} onClick={addNote}>
        <BoardNotes notes={notes} updateNote={updateNote} removeNote={removeNote} />
        <div className="tc-tray">
          <div className="tc-chalk-stick" />
          <div className="tc-chalk-stick" style={{ background: 'var(--chalk-gold)' }} />
          <div className="tc-eraser" />
        </div>

        <main className="tc-main">
          <div className="tc-toolbar">
            <Link to="/blog" className="tc-back">&larr; back to writing</Link>
            <button type="button" className="tc-print-btn" onClick={() => window.print()}>
              print / save as PDF{notes.length > 0 ? ` (with your ${notes.length} note${notes.length === 1 ? '' : 's'})` : ''}
            </button>
          </div>

          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
              </filter>
              <filter id="rough2" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="21" result="n2" />
                <feDisplacementMap in="SourceGraphic" in2="n2" scale="3.2" />
              </filter>
              <marker id="tc-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="var(--chalk)" />
              </marker>
            </defs>
          </svg>

          <div className="tc-masthead tc-reveal">
            <div className="tc-kicker">a research analysis, chalked up</div>
            <h1 className="tc-title">Tutor CoPilot</h1>
            <svg className="tc-underline" viewBox="0 0 220 10">
              <path d="M4,6 C 60,2 150,9 216,4" fill="none" stroke="var(--chalk-gold)" strokeWidth="3" strokeLinecap="round" filter="url(#rough2)" />
            </svg>
            <p className="tc-sub">An AI that doesn't tutor the student. It tutors the tutor, live, mid-sentence. Here's how, and whether it actually works.</p>
            <p className="tc-citation">Wang, Ribeiro, Robinson, Loeb &amp; Demszky (2025) &middot; &ldquo;Tutor CoPilot: A Human&ndash;AI Approach for Scaling Real-Time Expertise&rdquo;</p>
          </div>

          <section className="tc-panel tc-reveal">
            <div className="tc-panel__label">1. The problem it's aimed at</div>
            <p className="tc-panel__lede">In 1984, Benjamin Bloom found that one-on-one human tutoring pushes the average student about <strong style={{ color: 'var(--chalk-gold)' }}>two standard deviations</strong> above classroom instruction: roughly the 50th-percentile kid performing like the 98th. Nobody has ever figured out how to afford giving every student an expert tutor. That's the "2 Sigma problem."</p>
            <svg viewBox="0 0 760 240">
              <g filter="url(#rough)" fill="none" strokeLinecap="round">
                <path d="M20,210 C 160,210 180,60 330,60 C 480,60 500,210 640,210" stroke="var(--chalk-dim)" strokeWidth="2.5" />
                <path d="M140,210 C 280,210 300,20 450,20 C 600,20 620,210 720,210" stroke="var(--chalk-gold)" strokeWidth="2.5" />
                <path d="M330,60 L330,205" stroke="var(--chalk-dim)" strokeWidth="1.5" strokeDasharray="3 6" />
                <path d="M450,20 L450,205" stroke="var(--chalk-gold)" strokeWidth="1.5" strokeDasharray="3 6" />
                <path d="M335,45 L445,22" stroke="var(--chalk)" strokeWidth="2" markerEnd="url(#tc-arrow)" />
              </g>
              <text x="200" y="232" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="16">classroom instruction</text>
              <text x="470" y="232" fill="var(--chalk-gold)" fontFamily="ChalkHand" fontSize="16">1:1 human tutoring (+2&sigma;)</text>
              <text x="300" y="38" fill="var(--chalk)" fontFamily="ChalkHand" fontSize="14">the gap nobody can staff</text>
            </svg>
            <p className="tc-diagram-caption">two achievement curves, and the shift nobody could afford to scale, until now, maybe</p>
          </section>

          <section className="tc-panel tc-reveal">
            <div className="tc-panel__label">2. What the technology actually is</div>
            <p className="tc-panel__lede">This is <em>not</em> a chatbot replacing the tutor. It's a system sitting beside a real human tutor during a live online session, retrieval-augmented over transcripts of actual expert tutors, so its suggestions are grounded in what good tutoring sounds like, not generic LLM advice.</p>
            <svg viewBox="0 0 760 260">
              <g filter="url(#rough)" fill="none" stroke="var(--chalk)" strokeWidth="2.5">
                <rect x="40" y="40" width="190" height="80" rx="4" />
                <rect x="530" y="40" width="190" height="80" rx="4" />
                <rect x="285" y="150" width="190" height="90" rx="4" stroke="var(--chalk-blue)" />
              </g>
              <g filter="url(#rough2)" fill="none" stroke="var(--chalk-dim)" strokeWidth="2">
                <path d="M230,80 L530,80" markerEnd="url(#tc-arrow)" />
                <path d="M380,150 L335,120" markerEnd="url(#tc-arrow)" />
                <path d="M335,120 L380,150" strokeDasharray="2 5" />
              </g>
              <text x="60" y="75" fill="var(--chalk)" fontFamily="ChalkHand" fontSize="17">human tutor</text>
              <text x="60" y="97" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">talking to the student</text>
              <text x="548" y="75" fill="var(--chalk)" fontFamily="ChalkHand" fontSize="17">the student</text>
              <text x="548" y="97" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">live math session</text>
              <text x="305" y="178" fill="var(--chalk-blue)" fontFamily="ChalkHand" fontSize="16">Tutor CoPilot</text>
              <text x="305" y="200" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">retrieval over expert</text>
              <text x="305" y="217" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">tutor transcripts</text>
              <text x="420" y="110" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">suggests a move</text>
              <text x="250" y="140" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">accept / reject</text>
            </svg>
            <p className="tc-diagram-caption">a live suggestion, grounded in real expert sessions; the tutor still decides, and still speaks</p>
          </section>

          <section className="tc-panel tc-reveal">
            <div className="tc-panel__label">3. How they tested it</div>
            <p className="tc-panel__lede">Not a demo, not a pilot with volunteers who self-selected: a preregistered randomized controlled trial, the gold standard for "does this actually work," run on real online tutoring sessions with students from underserved communities.</p>
            <svg viewBox="0 0 760 200">
              <g filter="url(#rough)" fill="none" stroke="var(--chalk)" strokeWidth="2.5">
                <rect x="300" y="15" width="160" height="50" rx="4" />
                <rect x="60" y="120" width="260" height="60" rx="4" stroke="var(--chalk-gold)" />
                <rect x="440" y="120" width="260" height="60" rx="4" stroke="var(--chalk-dim)" />
              </g>
              <g fill="none" stroke="var(--chalk-dim)" strokeWidth="2" filter="url(#rough2)">
                <path d="M350,65 C 300,90 250,100 190,120" markerEnd="url(#tc-arrow)" />
                <path d="M410,65 C 460,90 520,100 570,120" markerEnd="url(#tc-arrow)" />
              </g>
              <text x="330" y="45" fill="var(--chalk)" fontFamily="ChalkHand" fontSize="15">700+ tutors</text>
              <text x="330" y="60" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">1,000+ students</text>
              <text x="90" y="150" fill="var(--chalk-gold)" fontFamily="ChalkHand" fontSize="16">treatment</text>
              <text x="90" y="168" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">tutoring + CoPilot</text>
              <text x="470" y="150" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="16">control</text>
              <text x="470" y="168" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="13">tutoring, business as usual</text>
            </svg>
            <p className="tc-diagram-caption">randomized at the tutor/session level, over a full semester of real math tutoring</p>
          </section>

          <section className="tc-panel tc-reveal">
            <div className="tc-panel__label">4. What actually happened</div>
            <p className="tc-panel__lede">Students mastered more math topics, and the gain wasn't evenly spread. It concentrated almost exactly where you'd most want it to.</p>
            <svg viewBox="0 0 760 220">
              <g filter="url(#rough)">
                <rect x="120" y="150" width="90" height="40" fill="none" stroke="var(--chalk-dim)" strokeWidth="2.5" />
                <rect x="330" y="80" width="90" height="110" fill="none" stroke="var(--chalk-gold)" strokeWidth="2.5" />
              </g>
              <path d="M60,195 L700,195" stroke="var(--chalk-faint)" strokeWidth="1.5" filter="url(#rough2)" />
              <text x="110" y="135" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="26">+4 pts</text>
              <text x="100" y="215" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="14">avg. mastery gain (p&lt;0.01)</text>
              <text x="320" y="68" fill="var(--chalk-gold)" fontFamily="ChalkHand" fontSize="26">+9 pts</text>
              <text x="300" y="215" fill="var(--chalk-dim)" fontFamily="ChalkHand" fontSize="14">students of lower-rated tutors</text>
              <text x="470" y="150" fill="var(--chalk)" fontFamily="ChalkHand" fontSize="15">+ tutors asked more guiding</text>
              <text x="470" y="170" fill="var(--chalk)" fontFamily="ChalkHand" fontSize="15">questions, gave fewer direct</text>
              <text x="470" y="190" fill="var(--chalk)" fontFamily="ChalkHand" fontSize="15">answers away</text>
            </svg>
            <div className="tc-stat-row">
              <div className="tc-stat">
                <div className="tc-stat__num">$20</div>
                <div className="tc-stat__cap">per tutor, per year: the whole cost of the lever</div>
              </div>
              <div className="tc-stat">
                <div className="tc-stat__num">2&times;</div>
                <div className="tc-stat__cap">roughly the gain for the least-experienced tutors vs. the average tutor</div>
              </div>
            </div>
          </section>

          <div className="tc-margin-note tc-reveal">
            <p>The interesting engineering idea here isn't "bolt a chatbot onto tutoring." It's <strong>retrieval over expert demonstrations</strong> as a way to take the tacit judgment locked inside your best people and hand it to everyone else, live, at the exact moment they need it. That's a pattern for scaling any scarce expertise; tutoring is just where they happened to point it first.</p>
            <p>Worth holding loosely: the measured outcome is a same-session mastery check, not months-later retention. We don't yet know if tutors keep the skill once the suggestions stop, or whether it just works as long as the crutch is there.</p>
          </div>

          <section className="tc-panel tc-reveal tc-closing" style={{ marginTop: 56 }}>
            <div className="tc-panel__label" style={{ textAlign: 'center' }}>5. Why I picked this one</div>
            <p>This is the same shape I've been building toward in my own work: not an AI that replaces the person doing the hard, human part of the job, but one that sits beside an overstretched human and hands them exactly the move an expert would make, right when they need it. A tutoring agent for the tutor, an escalation path for what it can't do. Scaling attention, not replacing it.</p>
            <div className="tc-signature">Blessy</div>
          </section>

          <footer className="tc-footer">
            Source: Wang, R. E., Ribeiro, A. T., Robinson, C. D., Loeb, S., &amp; Demszky, D. (2025).{' '}
            <a className="tc-source-link" href="https://arxiv.org/abs/2410.03017" target="_blank" rel="noopener noreferrer">arxiv.org/abs/2410.03017</a>
            {' '}&middot; surfaced via the{' '}
            <a className="tc-source-link" href="https://scale.stanford.edu/ai/evidence-base-review/evidence-base-ai-k12-november-review" target="_blank" rel="noopener noreferrer">Stanford AI-in-K12 evidence base review</a>
          </footer>
        </main>
      </div>
    </div>
  )
}
