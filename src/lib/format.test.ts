import { describe, expect, it } from 'vitest'
import { ERROR, formatEntry, formatNumber, tidy } from './format.ts'

describe('tidy', () => {
  it('removes floating point noise', () => {
    expect(tidy(0.1 + 0.2)).toBe(0.3)
    expect(tidy(1.1 * 3)).toBe(3.3)
  })
})

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1234567.5)).toBe('1,234,567.5')
  })

  it('switches to exponent notation for very large and very small values', () => {
    expect(formatNumber(1e13)).toBe('1e+13')
    expect(formatNumber(1.5e-9)).toBe('1.5e-9')
  })

  it('reports non-finite values as an error', () => {
    expect(formatNumber(Infinity)).toBe(ERROR)
    expect(formatNumber(NaN)).toBe(ERROR)
  })
})

describe('formatEntry', () => {
  it('groups the integer part while typing', () => {
    expect(formatEntry('1234')).toBe('1,234')
    expect(formatEntry('-1234567')).toBe('-1,234,567')
  })

  it('keeps a trailing decimal point and trailing zeros', () => {
    expect(formatEntry('1234.')).toBe('1,234.')
    expect(formatEntry('1000.50')).toBe('1,000.50')
  })

  it('leaves errors and exponent values alone', () => {
    expect(formatEntry(ERROR)).toBe(ERROR)
    expect(formatEntry('1e+21')).toBe('1e+21')
  })
})
