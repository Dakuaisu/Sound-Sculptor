const REASONS = {
  not_found: 'not on Spotify',
  search_failed: 'search failed',
}

/** Turn the backend's per-song statuses into "found N of M" plus the songs that weren't. */
export function summarizeMatches(songs) {
  if (!Array.isArray(songs) || songs.length === 0) return null
  const missing = songs
    .filter((s) => s.status !== 'matched')
    .map((s) => ({ title: s.title, artist: s.artist, reason: REASONS[s.status] ?? 'not matched' }))
  return { found: songs.length - missing.length, total: songs.length, missing }
}

export function matchHeadline({ found, total, missing }) {
  if (missing.length === 0) return `All ${total} found on Spotify`
  const rest = missing.length === 1 ? "this one couldn't be" : `these ${missing.length} couldn't be`
  return `${found} of ${total} found, ${rest}`
}
