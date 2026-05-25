export default {
  id: 'multiagent-cost',
  type: 'blog',
  title: 'Multi-agents cost 78% less. Here is the token breakdown.',
  subtitle: 'a controlled(ish) experiment in agentic workflow architectures.',
  status: 'published',
  url: null,
  feedUrl: null,
  desc: 'I rebuilt my portfolio with a subagent pipeline after building it solo. Same output, 78% cheaper. The token economics tell a story papers on multi-agent systems usually skip.',
  thumbnail: null,
  date: '2026-05-24',
  content: `
<p>I built a portfolio site with a single AI agent over three days. Then I gave a fresh set of agents the same spec and rebuilt the whole thing. Same output. 78% cheaper. Here is the actual breakdown.</p>

<h2>How I Got the Data</h2>

<p>Claude Code writes every session to a <code>.jsonl</code> file : one JSON object per turn, covering user messages, assistant responses, tool calls, and tool results. After the original build, that file was 8.3 MB. 766 user inputs buried inside /usage fragments, context compaction notices, and interrupted requests.</p>

<p>A Python filter pulled out the real prompts : skipping meta messages, sidechain entries, slash command outputs, anything that was the tooling talking to itself. What remained was 766 timestamped inputs: colour palette iteration, a shopping cart CSS animation, a HashRouter bug, a repo rename, a context compaction at 91% fill, Formspree at 2am.</p>

<h2>The Rebuild</h2>

<p>The 766 inputs were not replayed. Replaying them would reproduce the mistakes and iteration too : that is the single-agent run, not a test of a different architecture. Instead they were read as a specification source: what did the session actually settle on? That answer became a 10-task plan.</p>

<p>Each task went through a fixed pipeline: one agent implemented it with no prior context, a second checked whether the output matched the spec, a third checked code quality. Nothing moved forward until both reviewers signed off. Twenty-plus agent dispatches across ten tasks.</p>

<h2>The Numbers</h2>

<table>
  <thead><tr><th>Metric</th><th>Single-agent</th><th>Multi-agent</th><th>Δ</th></tr></thead>
  <tbody>
    <tr><td>Cost</td><td>$30.32</td><td>$6.54</td><td>−78%</td></tr>
    <tr><td>Cache reads</td><td>59.7M tokens</td><td>10.4M tokens</td><td>−83%</td></tr>
    <tr><td>Output tokens</td><td>354k</td><td>96k</td><td>−73%</td></tr>
    <tr><td>Cache writes</td><td>1.49M</td><td>0.50M</td><td>−66%</td></tr>
    <tr><td>Context peak</td><td>91% : compacted 6×</td><td>46% : never compacted</td><td>:</td></tr>
  </tbody>
</table>

<p>The orchestration skill itself : dispatching agents, running reviewers, tracking state : accounted for <strong>21% of session usage</strong>. One in five tokens was pipeline management, not implementation.</p>

<h2>Why Cache Reads Are the Number That Matters</h2>

<p>Output generation is not the expensive part. Cache reads are. Every turn re-reads the full accumulated context. At 91% fill, that is roughly 180k tokens of history on every late-session prompt : prior tool calls, half-finished debug attempts, the three times you typed the colour hex wrong.</p>

<p>Fresh-context subagents sidestep this entirely. Each one reads 2–3 targeted files and exits. Nothing accumulates. This is why the cache read delta is 83% rather than tracking the cost delta at 78% : the architecture is even more efficient on the dominant cost axis than the total bill suggests.</p>

<h2>What the Comparison Actually Measures</h2>

<p>This is not a clean A/B test. The multi-agent run had a written plan, reference files to copy verbatim, and no design iteration at all. The original session was doing discovery and construction at the same time : that is where most of the 766 inputs went. A fair comparison would hold information availability constant and vary only the architecture. This experiment conflates both.</p>

<p>The 21% coordination overhead also scales with agent count and coupling. At 10 tasks it is manageable. The crossover point where that overhead starts eating the fresh-context gain is worth measuring properly.</p>

<p>The single-agent numbers also include overhead the comparison does not control for. Categorising the 766 inputs: roughly 69% were productive implementation work, 26% were short fragments and noise, 5% were corrections and bug fixes. Strip those out and the clean-implementation cache read figure is closer to 38M tokens : which puts the adjusted delta at ~73% rather than 83%. Still significant. But the headline number overstates the architectural advantage by conflating discovery work with architecture.</p>

<h2>Practical Notes</h2>
<ul>
  <li><strong>Write the plan first.</strong> The plan pays for itself across every subagent that reads it. The expensive part of the original session was the discovery work : and that work is what makes a good plan possible.</li>
  <li><strong>Use the cheapest model that can handle the task.</strong> Not every step needs your most capable model. Review and verification tasks are usually mechanical : match model to task complexity. Model selection often matters more than architecture choice at small scale.</li>
  <li><strong>Cache reads are the cost to watch.</strong> Not output. Not input. Cache reads.</li>
  <li><strong>Compaction is a symptom, not a solution.</strong> The single-agent session hit 91% context fill and triggered automatic compaction 6 times : the model summarises prior context and continues from the summary. That compression is lossy. Detail gets flattened. The session continued, but with a progressively more degraded view of its own history. The multi-agent run ended at 46% without compacting once, because each subagent started fresh. If you are hitting compaction regularly, the architecture is telling you something: context is accumulating faster than the work justifies. That is either a signal to break the task down, or to switch to a fresh-context pattern.</li>
</ul>

<p>The follow-up post looks at what the diff between the two codebases actually revealed : which turned out to be the more interesting finding.</p>
  `,
}
