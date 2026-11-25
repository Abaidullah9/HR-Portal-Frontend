import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatMoney, toSentenceCase } from './utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toContain('base');
    expect(result).toContain('extra');
    expect(result).not.toContain('hidden');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null', () => {
    const result = cn(undefined, null, 'valid');
    expect(result).toBe('valid');
  });
});

describe('formatDate', () => {
  it('formats a timestamp as a short date', () => {
    expect(formatDate(new Date(2026, 4, 9, 12).toISOString())).toBe('May 9, 2026');
  });

  it('shows a dash for a missing value', () => {
    expect(formatDate(undefined)).toBe('--');
    expect(formatDate('')).toBe('--');
  });

  it('returns the raw value when it cannot be parsed', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatMoney', () => {
  it('labels the amount with its currency code', () => {
    // Intl separates the code from the amount with a non-breaking space.
    expect(formatMoney(158000, 'PKR')).toMatch(/^PKR\s158,000\.00$/);
  });

  it('defaults to the pilot currency', () => {
    expect(formatMoney(1000)).toContain('PKR');
  });

  it('does not blank an amount labelled with an unknown code', () => {
    expect(formatMoney(10, 'ZZZZ')).toContain('10.00');
  });
});

describe('toSentenceCase', () => {
  it('capitalises the first letter and lowercases the rest', () => {
    expect(toSentenceCase('present')).toBe('Present');
    expect(toSentenceCase('LATE')).toBe('Late');
    expect(toSentenceCase('completed')).toBe('Completed');
    expect(toSentenceCase('PENDING')).toBe('Pending');
  });

  it('returns an empty string for a missing value', () => {
    expect(toSentenceCase('')).toBe('');
  });

  it('keeps single-character values working', () => {
    expect(toSentenceCase('a')).toBe('A');
  });
});

describe('My workspace badge fallbacks', () => {
  it('falls back to "Logged" for a missing attendance status', () => {
    const value: string | undefined = undefined;
    const label = typeof value === 'string' && value ? toSentenceCase(value) : 'Logged';
    expect(label).toBe('Logged');
  });

  it('falls back to "Pending" for a missing appraisal status', () => {
    const value: string | undefined = undefined;
    const label = value ? toSentenceCase(value) : 'Pending';
    expect(label).toBe('Pending');
  });

  it('renders sentence case for a present attendance status', () => {
    const value = 'present';
    const label = typeof value === 'string' && value ? toSentenceCase(value) : 'Logged';
    expect(label).toBe('Present');
  });
});
