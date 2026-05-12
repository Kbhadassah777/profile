import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Info from './pages/Info.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/info" element={<Info />} />
        <Route path="/" element={<Navigate to="/info" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
