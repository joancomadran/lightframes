import test from 'node:test'
import assert from 'node:assert/strict'
import { processBatchIndividually } from '../src/lib/processBatchIndividually.js'

test('processes every item and preserves successes around a failed item', async () => {
  const items = ['first.jpg', 'broken.jpg', 'last.jpg']
  const result = await processBatchIndividually(items, async (name) => {
    if (name === 'broken.jpg') throw new Error('decode failed')
    return name.toUpperCase()
  })

  assert.deepEqual(result.successful, ['FIRST.JPG', 'LAST.JPG'])
  assert.equal(result.failed.length, 1)
  assert.equal(result.failed[0].item, 'broken.jpg')
  assert.match(result.failed[0].error.message, /decode failed/)
})

test('returns an empty success list when every item fails', async () => {
  const result = await processBatchIndividually([1, 2], async () => {
    throw new Error('invalid image')
  })

  assert.deepEqual(result.successful, [])
  assert.equal(result.failed.length, 2)
})

test('keeps input order and does not run items concurrently', async () => {
  const events = []
  const result = await processBatchIndividually([1, 2, 3], async (value) => {
    events.push(`start-${value}`)
    await Promise.resolve()
    events.push(`end-${value}`)
    return value
  })

  assert.deepEqual(events, [
    'start-1', 'end-1',
    'start-2', 'end-2',
    'start-3', 'end-3',
  ])
  assert.deepEqual(result.successful, [1, 2, 3])
})
