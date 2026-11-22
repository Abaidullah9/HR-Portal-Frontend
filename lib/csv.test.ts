import { describe, it, expect } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('joins cells with commas and rows with CRLF', () => {
    expect(toCsv([['a', 'b'], ['c', 'd']])).toBe('a,b\r\nc,d')
  })

  it('quotes cells containing a comma, quote or newline', () => {
    expect(toCsv([['Doe, Jane', 'say "hi"', 'two\nlines']])).toBe(
      '"Doe, Jane","say ""hi""","two\nlines"',
    )
  })

  it('treats null and undefined as empty cells', () => {
    expect(toCsv([[null, undefined, 0]])).toBe(',,0')
  })
})
