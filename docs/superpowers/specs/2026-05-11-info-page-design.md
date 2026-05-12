# Info Page + Audit Logger — Design Spec
Date: 2026-05-11

---

## Project Structure

```
my_portfolio/
├── client/                          ← Vite + React + React Router v6 (no TypeScript)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── pages/
│           └── Info.jsx
└── audit/                           ← standalone sidecar, not part of app
    ├── logger.js
    └── sessions.json                ← created on first write
```

---

## Part 1 — Audit Logger (`audit/logger.js`)

### Purpose
Standalone utility. Audits the Claude session that builds this app — prompts sent, tokens consumed, context window fill %. Used to compare single-agent vs multi-agent build sessions. Read manually. Not imported anywhere in the app.

### Interface (5 exported functions)

```js
logApiCall(agentId, task, usage, contextFill)
logHallucination(agentId, task, type, contextFill, strategy, tokensSpent, resolved)
logIntervention(agentId, triggeredBy, strategy, contextBefore, contextAfter, tokensSpent, resolved)
logContextPrune(agentId, before, after)
logSessionSummary(architecture, totals)
```

### Log Schema
Each call appends one entry to `audit/sessions.json` (pretty-printed JSON array).

```json
{
  "session_id": "uuid",
  "timestamp": "ISO string",
  "event_type": "api_call | hallucination | intervention | context_prune | session_summary",
  "agent_id": "master | subAgent1 | subAgent2",
  "task": "what was asked",
  "tokens": { "input": 0, "output": 0, "total": 0, "running_session_total": 0 },
  "context": { "messages_count": 0, "context_chars": 0, "context_fill_percent": 0.0 },
  "output_preview": "first 100 chars only",
  "duration_ms": 0
}
```

### Rules
- No Claude API calls inside logger
- wrap every write in try/catch silently — never block agent execution
- async fire-and-forget
- append-only, never overwrite sessions.json
- create sessions.json if it doesn't exist

---

## Part 2 — Info Page (`client/src/pages/Info.jsx`)

### Design System
- Font: -apple-system, SF Pro Display, Inter (fallback)
- All headings: font-weight 300, generous letter-spacing
- Body: font-weight 400, line-height 1.7
- No bold/heavy fonts
- Colors: white `#FFFFFF` / `#F5F5F7` alternating bg, text `#1D1D1F`, muted `#6E6E73`
- Accent sky blue `#5AC8FA`, light pink `#FFB3C6`, purple `#7F77DD` (interactive only)
- All animations: scroll-triggered fade-in (opacity 0 → 1, translateY 30px → 0, 0.6s ease)
- No bouncing, no jarring transitions
- Each section min 80vh, content max-width 800px centered, padding 80px top/bottom
- Mobile responsive

### Section 1 — Hero (white bg)
- Pill tag: "yes, I am a real person" — sky blue bg, white text, border-radius 999px
- Headline: "Hi, I'm Blessy." — 64px, weight 300, letter-spacing -1px
- Subtext: "I build things. I break things. I google why things broke. Occasionally in that order." — muted, 18px
- Avatar: large circle, initials "BH", light pink bg

### Section 2 — Who I Am (#F5F5F7 bg)
- Label: "a few things about me"
- 3 fact cards horizontal, white bg, large radius — with sarcastic subtitle in muted color
- **Game: True or False**
  - Pill buttons "True" and "False"
  - Sarcastic reaction in sky blue on answer
  - Auto-advance after 1.2s

Facts (dummy):
1. "I have shipped production code at 3am" — "the server didn't care about my sleep schedule"
2. "I have read an entire ML paper for fun" — "voluntarily. no one asked."
3. "I have blamed the framework before blaming myself" — "it was the framework. probably."

### Section 3 — Personal Projects (white bg)
- Label: "things I built"
- 3 cards in grid, white bg, large radius
- Sarcastic badge top-right in light pink
- Hover: translateY(-4px), transition 0.2s
- Cards:
  1. GPT-2 from scratch — "read the paper. built the thing. understood 60% of it." — Python, PyTorch — badge: "nobody asked"
  2. Multi-agent SaaS — "agents talking to agents. what could go wrong." — Claude API, Node.js, React — badge: "built at 2am"
  3. Context window research — "turns out more context = more chaos. documenting it." — badge: "jury's still out"
- **Game: pick which took longest**
  - Project name pills, one correct answer, sarcastic reactions in sky blue

### Section 4 — Almost^ Startups (#F5F5F7 bg) — ONE continuous section

**Part A — Ideas**
- Header: "almost^ startups" — ^ in purple `#7F77DD`, superscript, 16px, rotated 12deg inline-block
- Subtext: "ideas that were definitely going to change the world. briefly."
- 3 cards slightly rotated (-2deg, 1deg, -1.5deg), white, large radius
- "reason it didn't happen" tag in light pink at bottom of each card
- **Game: investor pitch mode**
  - One-line pitch shown
  - Buttons: "fund it" and "pass" — shark tank roast in sky blue either way
  - Rotates through 3-4 pitches

**Part B — Let's Cook** (same section, same bg, flows directly below Part A)
- Thin divider line + small label: "got an idea?"
- Headline: "lmk." — 64px, weight 300
- Subtext: "always looking for the next thing to build. drop an idea here — if something clicks, we can cook something together."
- Below: "Blessy will find these here. no promises. but also... maybe promises."
- **SVG cartoon**: simple stick figure with basket at market stall
  - Neutral face default → excited face when idea is added (JS class swap)
  - Under 30 lines SVG, simple shapes only
- **Idea drop box**:
  - Input: "drop an idea..."
  - Sky blue add button
  - Random comment on add: "bold." / "someone's already doing this but go off" / "i like where your head's at" / "controversial. I'm in." / "adding this to my personality"
  - Persists in localStorage
  - Checkmark to remove ideas

### Section 5 — Pen & Paper (white bg)
- Label: "pen & paper"
- Headline: "things I wrote." — 64px, weight 300, letter-spacing -1px
- Subtext: "blogs, pre-prints, half-baked thoughts. occasionally coherent." — muted
- **Opening animation**: CSS clip-path unfolding paper effect on scroll-into-view
  - Starts as small irregular polygon clip-path
  - Unfolds to full rectangle over 0.8s ease-out
  - Content card bg: `#FAFAF8`, border: 0.5px solid `#E8E4DC`
  - After unfold, content fades in 0.3s
- **Filter pills**: "All" | "Blog" | "Pre-print"
  - Active: sky blue bg, white text
  - Inactive: white bg, muted border
  - Smooth filter transition 0.2s
- **Row cards** (each):
  - Type badge left: "blog" → light pink pill | "pre-print" → sky blue pill
  - Title: thin font
  - Sarcastic subtitle: muted `#6E6E73`
  - Status badge right: "published" → sky blue | "coming soon" → muted gray | "in progress" → light pink
  - External link icon if published
  - Click to expand inline (show description placeholder), 0.3s ease — collapse on second click
- Content:
  - Blog: "Why I built GPT-2 from scratch" — "nobody asked. zero regrets." — LLMs — published
  - Blog: "Context windows and why they stress me out" — "more tokens ≠ more intelligence. groundbreaking." — Agentic AI — coming soon
  - Blog: "Multi-agent systems — a love/chaos story" — "what happens when you let AI talk to itself." — Agentic AI — coming soon
  - Blog: "Why I question every framework I use" — "finite things deserve infinite scrutiny." — Engineering — coming soon
  - Pre-print: "Context Window Complexity in Multi-Agent LLM Systems" — "turns out Big-O applies to vibes too." — Agentic AI, LLMs — in progress
- "see all writing →" link — sky blue, thin font → `/pen-and-paper`

---

## Implementation Notes

- Info.jsx is one file — all sections, all games, all state inline
- No external component library — pure CSS-in-JSX or a single `info.css`
- Scroll-triggered animations via IntersectionObserver
- localStorage for idea persistence
- All game state local (useState)
- Mobile responsive via CSS (flex/grid + media queries)
- SVG cartoon: inline in JSX, class swap via useState
