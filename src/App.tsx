import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import WeekPage from './pages/WeekPage'
import RegisterPage from './pages/RegisterPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import { useAppStore } from './store/useAppStore'
import { useEffect } from 'react'

function App() {
  const init = useAppStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="semana" element={<WeekPage />} />
          <Route path="registrar" element={<RegisterPage />} />
          <Route path="progreso" element={<ProgressPage />} />
          <Route path="ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
