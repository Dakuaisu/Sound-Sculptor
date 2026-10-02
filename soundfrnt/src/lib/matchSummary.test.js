// Synthetic fixtures shaped like the /api/ai/generate `songs` field.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeMatches, matchHeadline } from './matchSummary.js'

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
  assert.deepEqual(summary.missing.map((m) => [m.title, m.reason]), [
    ['Invented A', 'not on Spotify'],
    ['Invented B', 'not on Spotify'],
    ['Flaky', 'search failed'],
  ])
  assert.equal(matchHeadline(summary), "17 of 20 found, these 3 couldn't be")
})

test('singular and all-found headlines', () => {
  assert.equal(matchHeadline(summarizeMatches([song('a', 'matched'), song('b', 'not_found')])), "1 of 2 found, this one couldn't be")
  assert.equal(matchHeadline(summarizeMatches([song('a', 'matched')])), 'All 1 found on Spotify')
})

test('no per-song data (e.g. slider playlists) gives no summary', () => {
  assert.equal(summarizeMatches(undefined), null)
  assert.equal(summarizeMatches([]), null)
})
