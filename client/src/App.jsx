import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Info from './pages/Info.jsx'
import Blog from './pages/Blog.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/info" element={<Info />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        <Route path="/" element={<Navigate to="/info" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
