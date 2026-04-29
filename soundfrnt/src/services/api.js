const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  }

  const response = await fetch(url, config)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

export const api = {
  // Auth
  getUser: () => request('/me'),

  // Playlist generation (ML-based)
  predict: (features) =>
    request('/predict', {
      method: 'POST',
      body: JSON.stringify(features),
    }),

  createPlaylist: (trackIds, name = 'Sound Sculptor Playlist') =>
    request('/create-playlist', {
      method: 'POST',
      body: JSON.stringify({ track_ids: trackIds, name }),
    }),

  // AI generation
  generateAiPlaylist: (prompt) =>
    request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  savePlaylist: (playlistId) =>
    request('/ai/save', {
      method: 'POST',
      body: JSON.stringify({ playlist_id: playlistId }),
    }),

  // User data
  getUserData: () => request('/user-data'),

  // Discover Weekly
  saveDiscoverWeekly: () =>
    request('/save-discover-weekly', { method: 'POST' }),
}

export default api
