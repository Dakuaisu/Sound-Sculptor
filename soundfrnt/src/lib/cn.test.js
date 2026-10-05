import { test } from 'node:test'
import assert from 'node:assert/strict'
import tailwindConfig from '../../tailwind.config.js'
import { cn, CUSTOM_FONT_SIZES } from './cn.js'

const keep = (classes) => assert.equal(cn(classes), classes)

test('custom font sizes and text colours both survive, in either order', () => {
  keep('bg-grad-primary text-text-on-primary h-11 px-5 text-body-sm')
  keep('px-2.5 text-overline uppercase border-line text-text-2')
  keep('px-4 text-body text-text-1 placeholder:text-text-3')
  keep('border text-caption font-semibold text-text-3')
})

test('conflicting sizes and conflicting colours still merge', () => {
  assert.equal(cn('text-body-sm text-body'), 'text-body')
  assert.equal(cn('text-h1 text-sm'), 'text-sm')
  assert.equal(cn('text-text-2 text-text-1'), 'text-text-1')
})

test('every fontSize in tailwind.config.js is registered', () => {
  assert.deepEqual([...CUSTOM_FONT_SIZES].sort(), Object.keys(tailwindConfig.theme.extend.fontSize).sort())
})
