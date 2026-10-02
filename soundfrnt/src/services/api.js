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
  logout: () => request('/logout', { method: 'POST' }),

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
}

export default api
