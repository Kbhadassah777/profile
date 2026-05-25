export const WRITINGS = [
  {
    id: 'multiagent-cost',
    type: 'blog',
    title: 'Multi-agents cost 78% less. Here is the token breakdown.',
    subtitle: 'a controlled(ish) experiment in LLM architecture.',
    status: 'published',
    url: null,
    feedUrl: null,
    desc: 'I rebuilt my portfolio with a subagent pipeline after building it solo. Same output, 78% cheaper. The token economics tell a story papers on multi-agent systems usually skip.',
    thumbnail: null,
    date: '2026-05-24',
    content: `
<p>I built a portfolio site with a single AI agent over three days. Then I gave a fresh set of agents the same spec and rebuilt the whole thing. Same output. 78% cheaper. Here is the actual breakdown.</p>

<h2>How I Got the Data</h2>

<p>Claude Code writes every session to a <code>.jsonl</code> file — one JSON object per turn, covering user messages, assistant responses, tool calls, and tool results. After the original build, that file was 8.3 MB. 766 user inputs buried inside /usage fragments, context compaction notices, interrupted requests, and the occasional "dorry" typo.</p>

<p>A Python filter pulled out the real prompts:</p>

<pre><code>def is_real_input(entry):
    if entry.get("type") != "user": return False
    if entry.get("isMeta"):         return False
    if entry.get("isSidechain"):    return False
    content = entry["message"].get("content", "")
    return not any(content.strip().startswith(p) for p in SKIP_PREFIXES)</code></pre>

<p>Reading them in order gave a clear picture of what the session actually did: colour palette iteration, a shopping cart CSS animation, a HashRouter bug, a repo rename, a context compaction at 91% fill, Formspree integration at 2am. The JSONL is a complete trace of how a build actually happens — not how it looks in a commit history.</p>

<h2>The Rebuild</h2>

<p>The 766 inputs were not replayed. That would replay the mistakes too. Instead they were used as a specification source — reading through them revealed the final settled decisions and those got distilled into a 10-task plan. Each task had exact file paths, full code specs (not "implement X" — actual values), and explicit acceptance criteria.</p>

<p>The pipeline per task: one implementer subagent with a cold context window, one spec compliance reviewer, one code quality reviewer. Loop until both approve, then commit and move on. Twenty-plus dispatches across ten tasks. The build was clean at every checkpoint.</p>

<h2>The Numbers</h2>

<table>
  <thead><tr><th>Metric</th><th>Single-agent</th><th>Multi-agent</th><th>Δ</th></tr></thead>
  <tbody>
    <tr><td>Cost</td><td>$30.32</td><td>$6.54</td><td>−78%</td></tr>
    <tr><td>Cache reads</td><td>59.7M tokens</td><td>10.4M tokens</td><td>−83%</td></tr>
    <tr><td>Output tokens</td><td>354k</td><td>96k</td><td>−73%</td></tr>
    <tr><td>Cache writes</td><td>1.49M</td><td>0.50M</td><td>−66%</td></tr>
    <tr><td>Context peak</td><td>91% — compacted once</td><td>46% — never compacted</td><td>—</td></tr>
  </tbody>
</table>

<p>The orchestration skill itself — dispatching agents, running reviewers, tracking state — accounted for <strong>21% of session usage</strong>. One in five tokens was pipeline management, not implementation.</p>

<h2>Why Cache Reads Are the Number That Matters</h2>

<p>Output generation is not the expensive part. Cache reads are. Every turn re-reads the full accumulated context. At 91% fill, that is roughly 180k tokens of history on every late-session prompt — prior tool calls, half-finished debug attempts, the three times you typed the colour hex wrong.</p>

<p>Fresh-context subagents sidestep this entirely. Each one reads 2–3 targeted files and exits. Nothing accumulates. This is why the cache read delta is 83% rather than tracking the cost delta at 78% — the architecture is even more efficient on the dominant cost axis than the total bill suggests.</p>

<h2>What the Comparison Actually Measures</h2>

<p>This is not a clean A/B test. The multi-agent run had a written plan, reference files to copy verbatim, and no design iteration at all. The original session was doing discovery and construction at the same time — that is where most of the 766 inputs went. A fair comparison would hold information availability constant and vary only the architecture. This experiment conflates both.</p>

<p>The 21% coordination overhead also scales with agent count and coupling. At 10 tasks it is manageable. The crossover point where that overhead starts eating the fresh-context gain is worth measuring properly.</p>

<h2>Practical Notes</h2>
<ul>
  <li><strong>Write the plan first.</strong> The plan pays for itself across every subagent that reads it. The expensive part of the original session was the discovery work — and that work is what makes a good plan possible.</li>
  <li><strong>Use the cheapest model that can handle the task.</strong> Several review tasks ran on Haiku 4.5. Model selection had more impact than architecture choice at this scale.</li>
  <li><strong>Cache reads are the cost to watch.</strong> Not output. Not input. Cache reads.</li>
</ul>

<p>The follow-up post looks at what the diff between the two codebases actually revealed — which turned out to be the more interesting finding.</p>
    `,
  },
  {
    id: 'same-commands-different-code',
    type: 'blog',
    title: 'Same commands. Different code. Why the human is still the architect.',
    subtitle: 'what a git diff between two AI-built repos reveals.',
    status: 'published',
    url: null,
    feedUrl: null,
    desc: 'Both AI runs built the same portfolio. Both builds passed. Then I diffed the codebases — and found bugs that every automated reviewer had approved.',
    thumbnail: null,
    date: '2026-05-24',
    content: `
<p>I rebuilt my portfolio with a subagent pipeline after building it solo. Both codebases compiled. Both deployed. Then I ran <code>diff -rq</code> on them.</p>

<p>They were not the same.</p>

<h2>What the Diff Found</h2>

<p><strong>1. Import placement.</strong> The single-agent version added <code>import &#123; WRITINGS &#125;</code> at line 814 — mid-file, the exact point where it was first needed. The multi-agent version placed it at line 4. Both are valid. But they reflect something real: the single-agent added the import when the dependency became apparent during the session. The subagent front-loaded it because that is the convention its training weighted as clean. Same spec. Different process. Different artifact.</p>

<p><strong>2. Comment truncation.</strong> The original <code>theme.css</code> had full-length section separators:</p>
<pre><code>/* ── Design tokens ─────────────────────────────────────────────────── */</code></pre>
<p>The copy subagent shortened them:</p>
<pre><code>/* ── Design tokens ──────────────── */</code></pre>
<p>Functionally irrelevant. But predictable: models compress decorative padding when reproducing long lines. The original kept them because no prompt told it to shorten them. The subagent shortened them because the local copy operation weighted brevity. The generation process left its fingerprint on the file.</p>

<p><strong>3. Source ordering reflects dispatch order, not narrative order.</strong> The original defines sections in the sequence they were written: <code>Hero → WhoIAm → Now → Projects</code>. The multi-agent version defines <code>NowSection</code> immediately after <code>HeroSection</code> because that is when Task 3 ran. Same render output. Different internal structure — shaped by task boundaries, not by the natural flow of building a page.</p>

<p><strong>4. Cross-task parameter drift.</strong> <code>App.jsx</code> (Task 1) named the route parameter <code>:id</code>. <code>Blog.jsx</code> (Task 9) called <code>useParams()</code> for <code>slug</code>. Each agent was locally correct against its own spec. No single reviewer had seen both files in the same context window. The mismatch lived at the seam — invisible to per-task review, would silently return undefined in the browser.</p>

<h2>The Architectural Observation</h2>

<p>The code is not just a function of the spec. It is a function of the process that generated it.</p>

<p>The single-agent codebase carries the fingerprint of iteration under accumulating context: imports added at the moment of need, sections ordered as they were written, decisions shaped by what was in the window at 91% fill. The multi-agent codebase carries the fingerprint of task decomposition: top-level imports, task-ordered source layout, naming drift at task boundaries.</p>

<p>This is not a bug in either approach. It is a property of generation. A model's output is shaped by its local context — what was in the prompt, what prior tokens established, what training weighted as idiomatic. Change the process, and you change the context at each generation step, and you change the artifact.</p>

<h2>Where the Reviewer Pipeline Broke Down</h2>

<p>The pipeline had a spec compliance reviewer and a code quality reviewer per task. Both approved <code>App.jsx</code>. Both approved <code>Blog.jsx</code>. The build passed at every checkpoint.</p>

<p>The parameter mismatch only surfaced when a human reviewed across the seam — when someone asked "do these two files agree with each other?" rather than "does each file match its own task spec?"</p>

<p>This is not evidence that automated review is useless. It is evidence that local correctness and global consistency are different properties, and most current multi-agent pipelines are designed to verify the former more effectively than the latter. Per-task review catches whether a task was executed correctly. It does not catch whether two tasks made compatible assumptions.</p>

<p>There are architectural solutions to this — shared interface schemas defined before dispatch, typed contracts between tasks, integration validators that run across task outputs, centralized symbol tables the plan holds in scope. But those are design choices, not defaults. In this pipeline, none of them existed. The only participant maintaining continuity across all ten tasks was the human running the session.</p>

<h2>The Stronger Claim</h2>

<p>The argument here is not that AI agents are fundamentally incapable of global consistency. Context windows grow. Memory systems exist. Shared state and retrieval layers are real. The argument is narrower and, I think, more useful:</p>

<p><em>In most current multi-agent pipelines, context is distributed more effectively than architectural continuity is.</em></p>

<p>Each agent gets the context it needs for its task. What it does not get is a live model of what every other agent has decided. That gap — between local context and global coherence — is where seam failures live. Closing it is an architectural problem, not an implementation detail. You solve it with contracts, not with better prompts.</p>

<h2>What Changes If You Take This Seriously</h2>

<ul>
  <li><strong>Define shared interfaces before dispatching anything.</strong> Route parameter names, shared data shapes, CSS class names that cross file boundaries — lock these in the plan before any agent runs. Two agents inventing the same name independently will not always agree.</li>
  <li><strong>Diff the full output, not just per-task commits.</strong> Local review catches local correctness. Cross-output diff catches seam failures. Both are necessary. Neither replaces the other.</li>
  <li><strong>Treat seams as first-class architecture.</strong> The task decomposition is not just a project management choice. It determines where failure boundaries live in the generated code. Design the decomposition with that in mind.</li>
</ul>

<p>The full diff, both codebases, and the session JSONL are in the repo.</p>
    `,
  },
  {
    id: 'gpt2-blog',
    type: 'blog',
    title: 'Why I built GPT-2 from scratch',
    subtitle: 'nobody asked. zero regrets.',
    status: 'published',
    url: 'https://medium.com/ux-planet/mcp-is-dead-cf16b667ba6d',
    feedUrl: 'https://medium.com/feed/ux-planet',
    desc: 'A walkthrough of implementing the full GPT-2 architecture from scratch — attention heads, positional encodings, and the bits papers gloss over.',
    thumbnail: null,
    date: '2024-01-15',
  },
  {
    id: 'context-blog',
    type: 'blog',
    title: 'Context windows and why they stress me out',
    subtitle: 'more tokens ≠ more intelligence. groundbreaking.',
    status: 'coming-soon',
    url: null,
    feedUrl: null,
    desc: 'An honest look at what happens to LLM coherence as you push context to its limits.',
    thumbnail: null,
    date: null,
  },
  {
    id: 'multiagent-blog',
    type: 'blog',
    title: 'Multi-agent systems — a love/chaos story',
    subtitle: 'what happens when you let AI talk to itself.',
    status: 'coming-soon',
    url: null,
    feedUrl: null,
    desc: 'Building a multi-agent SaaS and discovering every failure mode the papers skip.',
    thumbnail: null,
    date: null,
  },
  {
    id: 'framework-blog',
    type: 'blog',
    title: 'Why I question every framework I use',
    subtitle: 'finite things deserve infinite scrutiny.',
    status: 'coming-soon',
    url: null,
    feedUrl: null,
    desc: "Abstractions have tradeoffs. This is about knowing which ones you're signing up for.",
    thumbnail: null,
    date: null,
  },
  {
    id: 'context-preprint',
    type: 'preprint',
    title: 'Context Window Complexity in Multi-Agent LLM Systems',
    subtitle: 'turns out Big-O applies to vibes too.',
    status: 'in-progress',
    url: null,
    feedUrl: null,
    desc: 'Formal analysis of how context window usage scales in multi-agent architectures and what that means for coherence.',
    thumbnail: null,
    date: null,
  },
]
