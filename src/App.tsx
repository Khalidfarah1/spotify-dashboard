import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Top5 from './pages/Top5'
import { useTheme } from './hooks/useTheme'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard theme={theme} onToggleTheme={toggle} />} />
          <Route path="/top5" element={<Top5 theme={theme} onToggleTheme={toggle} />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
