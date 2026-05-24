export const WRITINGS = [
  {
    id: 'multiagent-cost',
    type: 'blog',
    title: 'I rebuilt my portfolio twice. Multi-agents cost 78% less.',
    subtitle: 'a controlled(ish) experiment in LLM architecture.',
    status: 'published',
    url: null,
    feedUrl: null,
    desc: 'Same output. Same codebase. One agent vs ten. The token economics tell a story that papers on multi-agent systems usually skip.',
    thumbnail: null,
    date: '2026-05-24',
    content: `
<p>I built a portfolio site using Claude Code in a single long session. Then I rebuilt the same site using a subagent-driven multi-agent pipeline — one fresh agent per task, spec compliance review, code quality review, repeat. Here is what the token ledger looks like.</p>

<h2>The Experiment</h2>

<p>The single-agent run was organic: 766 user inputs over three days, simultaneous design exploration and implementation, color palette debates, routing bugs, a renamed GitHub repo, and a context compaction at 91% fill. Total cost: <strong>$30.32</strong>. Total cache reads: <strong>59.7M tokens</strong>.</p>

<p>The multi-agent run was structured: a pre-written 10-task plan, one implementer subagent per task (Sonnet 4.6 or Haiku 4.5 depending on complexity), a spec compliance reviewer, a code quality reviewer, and a final build check. Each agent started with a cold context window. Total cost: <strong>$6.54</strong>. Total cache reads: <strong>10.4M tokens</strong>.</p>

<h2>The Numbers</h2>

<table>
  <thead><tr><th>Metric</th><th>Single-agent</th><th>Multi-agent</th><th>Δ</th></tr></thead>
  <tbody>
    <tr><td>Cost</td><td>$30.32</td><td>$6.54</td><td>−78%</td></tr>
    <tr><td>Cache reads</td><td>59.7M tokens</td><td>10.4M tokens</td><td>−83%</td></tr>
    <tr><td>Output tokens</td><td>354k</td><td>96k</td><td>−73%</td></tr>
    <tr><td>Cache writes</td><td>1.49M</td><td>0.50M</td><td>−66%</td></tr>
    <tr><td>Context peak</td><td>91% (compacted)</td><td>46% (clean)</td><td>—</td></tr>
    <tr><td>Commits</td><td>mixed</td><td>10 scoped</td><td>—</td></tr>
  </tbody>
</table>

<p>The orchestration layer itself — the skill that dispatched and reviewed subagents — consumed <strong>21% of the session's usage</strong>. That is your coordination tax: measurable, non-trivial, and still worth paying.</p>

<h2>Why Cache Reads Dominate</h2>

<p>In any Claude Code session, the dominant cost is not output generation — it is <em>cache reads</em>. Every turn re-reads the full conversation context. A session at 91% context fill means every late-turn prompt is re-reading roughly 180k tokens of accumulated history: prior tool calls, intermediate outputs, debug attempts, colour palette discussions.</p>

<p>The multi-agent architecture breaks this accumulation. Each subagent starts at token zero. It reads a 2–3 file spec, produces output, and exits. The context never compounds. This is why the cache read delta is 83%, not 78% — fresh context is even more efficient than the cost delta suggests.</p>

<h2>The Caveat (and Why It Matters for Research)</h2>

<p>The comparison is not apples-to-apples, and being precise about why matters if you want to use this as a research data point.</p>

<p>The multi-agent run had three structural advantages the single-agent run did not:</p>

<ol>
  <li><strong>A pre-written plan.</strong> The 10-task implementation plan was written using the single-agent session's design decisions. Multi-agent had perfect information; single-agent was doing discovery simultaneously with construction.</li>
  <li><strong>Reference files to copy.</strong> Several tasks (info.css, blog.css, writings.js) were verbatim copies of files the original session produced. The implementer subagent read and reproduced — it did not design.</li>
  <li><strong>Zero design iteration.</strong> The 766 inputs in the original session include things like "make the background less light," "the spots should not overlap," "get rid of the HashRouter." None of that feedback loop exists in the multi-agent run.</li>
</ol>

<p>A cleaner experiment would compare: (a) single-agent with a pre-written plan vs (b) multi-agent with the same plan. That would isolate the architecture effect from the information-availability effect. The data here conflates both.</p>

<h2>What the 21% Coordination Tax Tells You</h2>

<p>The <code>superpowers:subagent-driven-development</code> orchestration skill consumed 21% of the session — roughly 1 in 5 tokens was the controller reading plans, constructing dispatch prompts, running reviewers, and updating task state. That is not negligible.</p>

<p>There is an analogy to distributed systems here: Amdahl's Law says the speedup from parallelism is bounded by the serial fraction. Multi-agent architectures pay a coordination overhead that grows with the number of agents. For this 10-task run, the overhead was tolerable. For a 100-task run with tightly coupled dependencies, the math would look different.</p>

<p>The question worth modelling formally: at what task count and coupling density does the coordination tax exceed the fresh-context gain? That is the question I am working through in the preprint below.</p>

<h2>Practical Implications</h2>

<p>If you are building on top of Claude Code or any LLM-based agentic system and cost is a constraint:</p>

<ul>
  <li>Write the plan before you run. The plan amortises across every subagent that reads it.</li>
  <li>Use the cheapest model that can handle the task. Several tasks in this run used Haiku 4.5 for review; Sonnet 4.6 for implementation. The model tier choice matters more than the architecture choice at small scale.</li>
  <li>Monitor cache reads, not output. Output tokens are cheap. Cache reads at scale are where the bill is.</li>
  <li>Fresh context per task is the primary lever. Any architecture that achieves fresh-context-per-unit-of-work will outperform a long accumulated session, even with coordination overhead.</li>
</ul>

<p>The source for this experiment — audit logs, session JSONs, the full JSONL trace — is in the portfolio repo. Everything here is reproducible.</p>
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
