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
<p>I built a portfolio site using Claude Code in a single long session. Then I rebuilt the same site using a subagent-driven multi-agent pipeline — one fresh agent per task, spec compliance review, code quality review, repeat. Here is what the token ledger looks like.</p>

<h2>The Environment: Recovering the Session</h2>

<p>Claude Code stores every session as a <code>.jsonl</code> file — one JSON object per line, each line representing a turn: user message, assistant response, tool call, tool result. After the single-agent portfolio build completed, that session file sat at <strong>8.3 MB</strong>, containing the full trace of 766 user inputs, all intermediate tool calls, every file read and write, every compile error and fix.</p>

<p>The first step was extracting the signal from the noise. A Python script filtered the JSONL for <code>type: "user"</code> entries, skipping meta messages, sidechain entries, slash command outputs, and /usage fragments that got pasted back into the chat. What remained was 766 timestamped human inputs — the actual prompts that drove the original build.</p>

<pre><code>def is_real_input(entry):
    if entry.get("type") != "user": return False
    if entry.get("isMeta"):         return False
    if entry.get("isSidechain"):    return False
    content = entry["message"].get("content", "")
    return not any(content.strip().startswith(p) for p in SKIP_PREFIXES)</code></pre>

<p>Reading those 766 inputs in order told the full story: colour palette debates, a CSS animation for a walking shopping cart, a HashRouter routing bug, a GitHub repo rename mid-session, a context compaction at 91% fill, and a Formspree form at 2am. The JSONL is a ground-truth log of every decision, mistake, and correction.</p>

<h2>How the Recreation Worked</h2>

<p>The 766 inputs were not replayed one-by-one. Replaying raw history would reproduce the mistakes too — that is not a fair architecture test. Instead, the inputs were used as a <em>specification source</em>: reading through them revealed the final settled decisions (palette, sections, animations, deploy config) and those decisions were codified into a 10-task implementation plan.</p>

<p>Each task had: exact file paths, complete code specs (actual CSS values, JSX structure, API endpoints), a reference pointer to the original file for verbatim copy tasks, and explicit acceptance criteria. Then <code>subagent-driven-development</code> dispatched the pipeline: one implementer per task with a cold context window, followed by a spec compliance reviewer, then a code quality reviewer. Ten tasks. Twenty-plus dispatches. Ten scoped commits. Clean build at every checkpoint.</p>

<h2>The Numbers</h2>

<table>
  <thead><tr><th>Metric</th><th>Single-agent</th><th>Multi-agent</th><th>Δ</th></tr></thead>
  <tbody>
    <tr><td>Cost</td><td>$30.32</td><td>$6.54</td><td>−78%</td></tr>
    <tr><td>Cache reads</td><td>59.7M tokens</td><td>10.4M tokens</td><td>−83%</td></tr>
    <tr><td>Output tokens</td><td>354k</td><td>96k</td><td>−73%</td></tr>
    <tr><td>Cache writes</td><td>1.49M</td><td>0.50M</td><td>−66%</td></tr>
    <tr><td>Context peak</td><td>91% (compacted)</td><td>46% (clean)</td><td>—</td></tr>
  </tbody>
</table>

<p>The orchestration layer itself — dispatching subagents, running reviewers, updating task state — consumed <strong>21% of the session</strong>. That is your coordination tax: 1 in 5 tokens just managing the pipeline, not doing work.</p>

<h2>Why Cache Reads Dominate</h2>

<p>The dominant cost is not output generation — it is <em>cache reads</em>. Every turn re-reads the full conversation context. At 91% fill, every late-session prompt re-reads ~180k tokens of accumulated history: prior tool calls, debug attempts, colour palette discussions. The multi-agent architecture breaks this. Each subagent starts at token zero, reads 2–3 files, produces output, exits. Context never compounds. This is why the cache read delta is 83%, not 78%.</p>

<h2>The Caveat</h2>

<p>The comparison is not apples-to-apples. The multi-agent run had a pre-written plan, reference files to copy, and zero design iteration. The single-agent run was doing discovery and construction simultaneously. A cleaner experiment would compare both architectures against the same pre-written plan — isolating architecture from information-availability. The data here conflates both.</p>

<p>There is also an Amdahl's Law ceiling: orchestration overhead grows with agent count. For this 10-task run the 21% tax was tolerable. For a 100-task run with tight coupling, the math changes.</p>

<h2>Practical Takeaways</h2>
<ul>
  <li><strong>Write the plan before you run.</strong> The plan amortises across every subagent that reads it.</li>
  <li><strong>Use cheaper models for review tasks.</strong> Several tasks used Haiku 4.5 for review; Sonnet 4.6 for implementation. Model tier matters more than architecture at small scale.</li>
  <li><strong>Monitor cache reads, not output.</strong> Output tokens are cheap. Cache reads at scale are where the bill lives.</li>
</ul>

<p>The JSONL trace, audit logs, and both codebases are in the portfolio repo. The diff between the two repos is covered in the follow-up post.</p>
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
<p>I built my portfolio with a single AI agent. Then I gave a fresh set of agents the same spec and the same reference files. Both runs produced working software. Both builds passed. Then I ran <code>diff -rq</code> on the two codebases.</p>

<p>They were not the same.</p>

<h2>Four Differences, None in the Spec</h2>

<p><strong>1. Import placement.</strong> The single-agent version added <code>import &#123; WRITINGS &#125;</code> at line 814 — mid-file, exactly where it was first needed during the session. The multi-agent version placed it at line 4, top of file, correct ES module practice. Same instruction. Different mental model of when imports get resolved. The human agent added it when the need appeared. The subagent front-loaded it by convention.</p>

<p><strong>2. Comment verbosity.</strong> The single-agent preserved full decorative separators:</p>
<pre><code>/* ── Design tokens ─────────────────────────────────────────────────── */</code></pre>
<p>The subagent that copied <code>theme.css</code> truncated them:</p>
<pre><code>/* ── Design tokens ──────────────── */</code></pre>
<p>Functionally identical. But models tend to compress decorative padding when copying long lines. The human-authored file kept them because nothing said to shorten them. The model shortened them because that is what compression does.</p>

<p><strong>3. Section ordering in source.</strong> The original defines sections in the order they were written — <code>Hero → WhoIAm → Now → Projects</code>. The multi-agent version defines <code>NowSection</code> immediately after <code>HeroSection</code> because Task 3 asked for it then, then fills the rest in task order. Render output is identical. Source order reflects two different things: <em>how the work happened</em> versus <em>how the tasks were dispatched</em>.</p>

<p><strong>4. A cross-task naming bug.</strong> <code>App.jsx</code> (Task 1) defined the route parameter as <code>:id</code>. <code>Blog.jsx</code> (Task 9) called <code>useParams()</code> for <code>slug</code>. Both agents were locally correct — the route spec said "id", the blog spec said "slug" — but no single reviewer had seen both files in the same context. The seam between tasks produced a silent mismatch: blog post links would return undefined in the browser.</p>

<h2>The Spec Compliance Reviewer Approved Both</h2>

<p>This is the part that matters. The pipeline had a spec compliance reviewer and a code quality reviewer per task. Both reviewers approved <code>App.jsx</code>. Both approved <code>Blog.jsx</code>. Every checkpoint was green. The build passed.</p>

<p>The bug only became visible when a human looked across the seam — when someone ran <code>diff</code> on the full output and asked "do these two files agree with each other?" That question is structurally unavailable to any subagent with a cold context window. The reviewer for Task 1 did not know what Task 9 would name its parameter. The reviewer for Task 9 did not know what Task 1 had already committed.</p>

<h2>Same Commands, Different Code</h2>

<p>This is what token cost comparisons miss. Both runs received the same high-level intent. Both produced working software. But the resulting code carries the fingerprint of the process that generated it.</p>

<p>The single-agent code reflects iteration: imports added where first needed, sections ordered as written, decisions made under context pressure at 91% fill. The multi-agent code reflects task decomposition: top-level imports, task-ordered source layout, naming drift at boundaries.</p>

<p>The model is not a deterministic compiler. Given identical inputs at different times, in different contexts, with different prior tokens in the window, it makes different judgment calls — where to put an import, how long a comment should be, what to name a route parameter. Those calls are shaped by local context, not global consistency.</p>

<h2>The Human in the Loop Is Not a Safety Layer</h2>

<p>The automation argument usually runs: if the spec is complete enough, the agent does not need oversight. This experiment runs the other direction. The spec was complete. The reviewers approved every task. The build passed. A latent bug remained — and only a cross-file human review caught it.</p>

<p>The human role in an agentic pipeline is not writing the spec and reading the final output. It is holding the global view that no single agent has. Each subagent sees its task. No subagent sees the system. That is not a model limitation — it is structural. An agent with a cold context window cannot maintain state across tasks it did not execute. That is the design.</p>

<p>This is why "human in the loop" is not a trust qualifier or a regulatory hedge. It is an architectural requirement. The human is the only participant in the pipeline with continuity across the full session. Remove that continuity, and you are trusting that no judgment call at any seam will conflict with any other. In this experiment, one did.</p>

<h2>What This Changes About How You Should Build</h2>

<ul>
  <li><strong>Diff the full output, not just per-task diffs.</strong> Each task's commit looks clean. The cross-task inconsistency only appears when you look at the whole.</li>
  <li><strong>Name interfaces before you dispatch.</strong> If Task 1 and Task 9 both touch a shared interface (a route param, a data field, a CSS class name), define the name explicitly in the plan before either task runs. Do not let two subagents invent the same name independently.</li>
  <li><strong>The seam is where quality lives.</strong> Local correctness is easy to verify — that is what automated reviewers do well. Global consistency requires a view no subagent has. Build the review process around the seams, not just the tasks.</li>
  <li><strong>The human is the architect.</strong> Agents execute. They do not hold the system in mind. The architecture is the human's job, and it does not end when the plan is written.</li>
</ul>

<p>The full diff, both codebases, and the JSONL trace are in the portfolio repo.</p>
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
