import { describe, expect, test } from 'vitest';

import { safeParseStoredValue } from '../storageValidation';

describe('storage validation', () => {
  test('returns fallback for invalid JSON instead of throwing', () => {
    expect(safeParseStoredValue('{bad-json', { ok: false }, (value): value is { ok: boolean } => typeof value === 'object')).toEqual({ ok: false });
  });

  test('returns fallback when parsed data fails validation', () => {
    expect(safeParseStoredValue('{"id":1}', { id: 'fallback' }, (value): value is { id: string } => {
      return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string';
    })).toEqual({ id: 'fallback' });
  });

  test('returns parsed value when validation passes', () => {
    expect(safeParseStoredValue('{"id":"user-1"}', null, (value): value is { id: string } => {
      return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'string';
    })).toEqual({ id: 'user-1' });
  });
});
