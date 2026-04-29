import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import About from './pages/About'
import Connect from './pages/Connect'
import Choice from './pages/Choice'
import MoodStep from './pages/MoodStep'
import GenreStep from './pages/GenreStep'
import SliderStep from './pages/SliderStep'
import AiStep from './pages/AiStep'
import Finished from './pages/Finished'
import useStore from './stores/useStore'

function ErrorToast() {
  const { error, clearError } = useStore()
  if (!error) return null
  return (
    <div className="error-toast">
      <span>{error}</span>
      <button onClick={clearError}>&times;</button>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ErrorToast />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/choice" element={<Choice />} />
          <Route path="/create/mood" element={<MoodStep />} />
          <Route path="/create/genre" element={<GenreStep />} />
          <Route path="/create/sliders" element={<SliderStep />} />
          <Route path="/create/ai" element={<AiStep />} />
          <Route path="/finished" element={<Finished />} />
        </Route>
      </Routes>
    </>
  )
}
