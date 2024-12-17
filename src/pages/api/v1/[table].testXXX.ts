import { expect, test } from 'vitest'
import { GET } from './[table]'

test('adds 1 + 2 to equal 3', () => {
  const result = GET({
    site: 'exampleSite',
    generator: 'exampleGenerator',
    url: 'exampleUrl',
    props: {},
    params: {'table': 'test'}
  });

  expect(result).toEqual({})
})