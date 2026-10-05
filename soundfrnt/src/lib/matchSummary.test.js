// Synthetic fixtures shaped like the /api/ai/generate `songs` field.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeMatches, matchHeadline, missingToggleLabel } from './matchSummary.js'

const song = (title, status) => ({ title, artist: 'Artist', status, track: status === 'matched' ? { id: title } : null })

test('counts found songs and lists the ones that were not', () => {
  const songs = [
    ...Array.from({ length: 17 }, (_, i) => song(`Hit ${i}`, 'matched')),
    song('Invented A', 'not_found'),
    song('Invented B', 'not_found'),
    song('Flaky', 'search_failed'),
  ]
  const summary = summarizeMatches(songs)
  assert.equal(summary.found, 17)
  assert.equal(summary.total, 20)
  assert.deepEqual(summary.missing.map((m) => [m.title, m.artist, m.reason]), [
    ['Invented A', 'Artist', 'Not found on Spotify'],
    ['Invented B', 'Artist', 'Not found on Spotify'],
    ['Flaky', 'Artist', 'Spotify search failed'],
  ])
  assert.equal(matchHeadline(summary), '17 of 20 suggested songs found on Spotify')
  assert.equal(missingToggleLabel(summary), "3 songs weren't added")
})

test('singular wording', () => {
  assert.equal(matchHeadline(summarizeMatches([song('a', 'matched')])), '1 of 1 suggested song found on Spotify')
  assert.equal(
    missingToggleLabel(summarizeMatches([song('a', 'matched'), song('b', 'not_found')])),
    "1 song wasn't added",
  )
})

test('all found leaves nothing missing', () => {
  const summary = summarizeMatches([song('a', 'matched'), song('b', 'matched')])
  assert.equal(summary.missing.length, 0)
  assert.equal(matchHeadline(summary), '2 of 2 suggested songs found on Spotify')
})

test('no per-song data (e.g. slider playlists) gives no summary', () => {
  assert.equal(summarizeMatches(undefined), null)
  assert.equal(summarizeMatches([]), null)
})
