import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Info from './pages/Info.jsx'
import Blog from './pages/Blog.jsx'
import TutorCopilotBoard from './pages/TutorCopilotBoard.jsx'

export default function App() {
  return (
    <BrowserRouter basename="/profile">
      <Routes>
        <Route path="/" element={<Info />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        <Route path="/research/tutor-copilot" element={<TutorCopilotBoard />} />
      </Routes>
    </BrowserRouter>
  )
}
