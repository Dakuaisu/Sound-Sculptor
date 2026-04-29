import { useNavigate } from 'react-router-dom'
import useStore from '@/stores/useStore'
import api from '@/services/api'
import { useState } from 'react'

export default function Finished() {
  const navigate = useNavigate()
  const { playlist, resetWizard, clearPlaylist } = useStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!playlist) {
    return (
      <div className="container">
        <div className="container2">
          <h1>No Playlist Found</h1>
          <p className="subheading">Go back and create one first.</p>
          <button
            className="pretty-button"
            onClick={() => navigate('/choice')}
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  const spotifyEmbedUrl = `https://open.spotify.com/embed/playlist/${playlist.playlist_id}`

  async function handleSave() {
    setSaving(true)
    try {
      await api.savePlaylist(playlist.playlist_id)
      setSaved(true)
    } catch (err) {
      console.error('Failed to save playlist:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleCreateAnother() {
    resetWizard()
    clearPlaylist()
    navigate('/choice')
  }

  return (
    <div className="container">
      <div className="finished-card">
        <h1>Your Playlist is Ready!</h1>

        {playlist.playlist_name && (
          <h2 className="playlist-name">{playlist.playlist_name}</h2>
        )}

        <div className="spotify-embed">
          <iframe
            title="Spotify Playlist"
            src={spotifyEmbedUrl}
            width="100%"
            height="380"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>

        {playlist.tracks && (
          <p className="track-count">
            {playlist.total_matched} of {playlist.total_requested} tracks
            matched
          </p>
        )}

        {playlist.external_url && (
          <a
            href={playlist.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="pretty-button open-spotify"
          >
            Open in Spotify
          </a>
        )}

        <div className="finished-actions">
          {!saved && (
            <button
              className="pretty-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save to Library'}
            </button>
          )}
          {saved && <p className="saved-message">Saved to your library!</p>}
          <button className="pretty-button secondary" onClick={handleCreateAnother}>
            Create Another
          </button>
        </div>
      </div>
    </div>
  )
}
