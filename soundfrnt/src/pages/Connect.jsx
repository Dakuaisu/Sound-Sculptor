import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import useStore from '@/stores/useStore'
import Spinner from '@/components/Spinner'
import image from '@/images/image.png'

export default function Connect() {
  const navigate = useNavigate()
  const { isAuthenticated, setUser } = useStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    api
      .getUser()
      .then((user) => {
        setUser(user)
        navigate('/choice', { replace: true })
      })
      .catch(() => {
        setChecking(false)
      })
  }, [navigate, setUser])

  if (checking) {
    return <Spinner message="Checking Spotify connection..." />
  }

  return (
    <div className="container">
      <div className="connect-card">
        <img src={image} alt="Spotify" className="connect-image" />
        <h2>Connect to Spotify</h2>
        <p className="description-text">
          Link your Spotify account to start sculpting personalized playlists.
        </p>
        <a href="/api/connect" className="pretty-button connect-btn">
          Connect with Spotify
        </a>
      </div>
    </div>
  )
}
