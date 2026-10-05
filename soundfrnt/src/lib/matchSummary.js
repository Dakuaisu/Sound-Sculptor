const REASONS = {
  not_found: 'Not found on Spotify',
  search_failed: 'Spotify search failed',
}

/** Turn the backend's per-song statuses into "found N of M" plus the songs that weren't. */
export function summarizeMatches(songs) {
  if (!Array.isArray(songs) || songs.length === 0) return null
  const missing = songs
    .filter((s) => s.status !== 'matched')
    .map((s) => ({ title: s.title, artist: s.artist, reason: REASONS[s.status] ?? 'Not matched' }))
  return { found: songs.length - missing.length, total: songs.length, missing }
}

export function matchHeadline({ found, total }) {
  return `${found} of ${total} suggested ${total === 1 ? 'song' : 'songs'} found on Spotify`
}

export function missingToggleLabel({ missing }) {
  const n = missing.length
  return n === 1 ? "1 song wasn't added" : `${n} songs weren't added`
}
