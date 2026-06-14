import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Toaster from '@/components/ui/Toaster'
import { Loader } from '@/components/ui/Loader'
import { useAuthBootstrap } from '@/hooks/useAuth'
import useStore from '@/stores/useStore'

import Landing from './pages/Landing'
import About from './pages/About'
import Connect from './pages/Connect'
import Choice from './pages/Choice'
import MoodStep from './pages/MoodStep'
import GenreStep from './pages/GenreStep'
import SliderStep from './pages/SliderStep'
import AiStep from './pages/AiStep'
import Finished from './pages/Finished'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RequireAuth({ children }) {
  const authReady = useStore((s) => s.authReady)
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!authReady) return <Loader message="Reconnecting to Spotify…" />
  if (!isAuthenticated) return <Navigate to="/connect" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  useAuthBootstrap()

  return (
    <>
      <Toaster />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/choice" element={<RequireAuth><Choice /></RequireAuth>} />
          <Route path="/create/mood" element={<RequireAuth><MoodStep /></RequireAuth>} />
          <Route path="/create/genre" element={<RequireAuth><GenreStep /></RequireAuth>} />
          <Route path="/create/sliders" element={<RequireAuth><SliderStep /></RequireAuth>} />
          <Route path="/create/ai" element={<RequireAuth><AiStep /></RequireAuth>} />
          <Route path="/finished" element={<RequireAuth><Finished /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
