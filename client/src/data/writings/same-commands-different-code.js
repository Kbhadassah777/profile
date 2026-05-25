export default {
  id: 'same-commands-different-code',
  type: 'blog',
  title: 'Same commands. Different code. Why the human is still the architect.',
  subtitle: 'what a git diff between two AI-built repos reveals.',
  status: 'published',
  url: null,
  feedUrl: null,
  desc: 'Both AI runs built the same portfolio. Both builds passed. Then I diffed the codebases : and found bugs that every automated reviewer had approved.',
  thumbnail: null,
  date: '2026-05-24',
  content: `
<p>I built my portfolio twice. Once with a single AI agent. Once with a team of agents working in parallel. Both versions compiled. Both deployed. Both looked identical in the browser.</p>

<p>Then I compared the actual code files side by side.</p>

<p>They were not the same.</p>

<h2>What Was Different</h2>

<p><strong>1. Decorative formatting got trimmed.</strong> The original CSS file had long separator comments that looked like this:</p>
<pre><code>/* ── Design tokens ─────────────────────────────────────────────────── */</code></pre>
<p>The agent that copied the file shortened them to:</p>
<pre><code>/* ── Design tokens ──────────────── */</code></pre>
<p>Nothing breaks. Nothing changes visually. But the agent compressed the decorative dashes because it was optimising for brevity locally. The original kept them because no one told it to shorten them. Small thing. But a visible fingerprint of how each version was made.</p>

<p><strong>2. Code order followed task order, not page order.</strong> The solo agent wrote sections in the natural sequence of the page: Hero, then Who I Am, then Now, then Projects. The multi-agent version defined the Now section second because that was Task 3 in the plan. The page renders identically — the browser does not care about source order here — but if you read the code, one reads like a story and the other reads like a task list.</p>

<p><strong>3. A real bug at the handoff point.</strong> This one actually broke something. The first agent (Task 1) set up the URL routing and named the route parameter <code>:id</code>. The ninth agent (Task 9) wrote the blog page and expected the same parameter to be called <code>slug</code>. Both agents were correct within their own files. Neither had seen the other's work. The mismatch meant clicking a blog post would silently fail : the page would load but find nothing, because it was looking for a variable that did not exist under that name.</p>

<h2>Why This Happens</h2>

<p>The code you get is not just a product of the instructions you give. It is also a product of how the work got done.</p>

<p>A solo agent working through a session accumulates context. It remembers what it decided ten steps ago. It adds things when it needs them, in the order it needs them. Its decisions compound on each other.</p>

<p>A team of agents working on separate tasks starts fresh each time. Each one only knows its own task. There is no shared memory, no running awareness of what the others decided. The handoff points between tasks are where things can quietly drift apart.</p>

<h2>Where the Reviewers Missed It</h2>

<p>Each task in the multi-agent run had two reviewers : one checking that the output matched the spec, one checking code quality. Both approved the routing file. Both approved the blog file. Every checkpoint passed.</p>

<p>The bug only appeared when someone looked across both files at the same time and asked: do these two agree? That question was never part of any single reviewer's job. Each reviewer was checking their own task. No one was checking the joins between tasks.</p>

<p>This is not a failure of the reviewers. It is a gap in how the pipeline was designed. Checking that each piece is correct is not the same as checking that the pieces fit together.</p>

<h2>The Practical Fix</h2>

<p>The solutions are not complicated, they just have to be deliberate:</p>

<ul>
  <li><strong>Lock shared names before any agent starts.</strong> If two parts of the codebase need to agree on a name : a route parameter, a data field, a CSS class : write it down in the plan before dispatching anyone. Two agents will not automatically land on the same word.</li>
  <li><strong>Compare the full output at the end, not just each piece.</strong> Per-task review catches whether each task was done correctly. A full diff at the end catches whether the tasks fit together. Both checks are necessary.</li>
  <li><strong>Know where your handoff points are.</strong> The task breakdown is not just a planning decision. It decides where the risk lives. Design around the joins, not just the tasks.</li>
</ul>

<p>The human was the only participant who saw the whole thing at once. That turned out to matter.</p>
  `,
}
