export default {
  id: 'multiagent-tutoring',
  type: 'blog',
  title: 'What multi-agent systems could teach edtech about scaling attention',
  subtitle: 'one tutor-agent is a chatbot. a few, working together, is closer to a school.',
  status: 'published',
  url: null,
  feedUrl: null,
  desc: 'I build multi-agent systems for a living. Here is what that architecture looks like pointed at the oldest problem in education: one teacher, thirty students, and not enough hours.',
  thumbnail: null,
  date: '2026-11-18',
  content: `
<p>Most "AI tutor" products today are one model wearing a tutor costume: a single chat window that explains, quizzes, and encourages, all in one undifferentiated voice. That works fine for a single session. It starts to strain the moment you ask it to do what an actual school does: track a student over months, coordinate across subjects, and know when to escalate to a human.</p>

<p>I spend my day job building multi-agent systems: several specialized agents, each with a narrow job, coordinating on a shared task. It's the same architecture pattern showing up in backend infrastructure and in agentic coding tools. Pointed at education instead of software, the shape of it looks like this:</p>

<h2>A Sketch of the Architecture</h2>

<ul>
  <li><strong>A tutoring agent</strong>: the Socratic, in-the-moment one. Its only job is the current question: ask the next thing, don't give away the answer too early.</li>
  <li><strong>A curriculum agent</strong>: holds the map. Knows what the student already covered, what depends on what, and decides what should come next, instead of the tutoring agent improvising scope on the fly.</li>
  <li><strong>An assessment agent</strong>: watches for the misconception underneath the wrong answer, not just the wrong answer itself, and feeds that signal back to the curriculum agent.</li>
  <li><strong>An escalation agent</strong>: the one whose entire job is noticing when a student is stuck in a way no amount of rephrasing will fix, and surfacing that to an actual human teacher.</li>
</ul>

<p>Separating these out isn't an aesthetic choice. It's the same reason you separate them in software: a single agent juggling "be encouraging," "stay on pedagogical sequence," "diagnose the error," and "know your own limits" at once tends to do all four worse than four agents each doing one well. Context is the scarce resource; the same lesson that shows up in cost breakdowns for coding agents applies just as directly here.</p>

<h2>Why This Isn't Just a Chatbot With Extra Steps</h2>

<p>The honest failure mode of multi-agent systems is coordination overhead: agents that don't share context can quietly disagree, or duplicate work, at the handoff points. In a classroom, that risk has a direct analogue: it's exactly what happens when a tutoring system and a curriculum plan drift out of sync with no one checking the join. The fix is the same fix as in software: lock the shared contract (what "mastery" of a concept means, what signal gets passed between agents) before anyone starts generating a single tutoring session.</p>

<p>Done carelessly, this is a gimmick, a more expensive chatbot with a sci-fi name. Done deliberately, it's the first architecture that actually matches the shape of what a good school already does: specialized roles, a shared plan, and a human who sees the whole student, not just one session.</p>

<p>That's the version worth building. It's also, not coincidentally, the direction I'd like to spend the next chunk of my career pointed at.</p>
  `,
}
