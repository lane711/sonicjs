import { expect, test } from 'vitest'
import { sum } from './sum.js'

test('adds 1 + 2 to equal 3', () => {
  console.log('test ===>')
  expect(sum(1, 2)).toBe(3)
})