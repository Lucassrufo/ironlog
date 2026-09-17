import { describe, expect, it } from 'vitest';

import { sanitizeOwnProfilePayload } from '../profilePayload';

describe('profileService', () => {
  it('uses a safe default name when the typed name is too short for database constraints', () => {
    expect(
      sanitizeOwnProfilePayload({
        id: 'user-1',
        role: 'student',
        name: 'A',
        email: 'aluno@ironlog.com',
      }),
    ).toEqual({
      id: 'user-1',
      role: 'student',
      name: 'Usuario IronLog',
      email: 'aluno@ironlog.com',
    });
  });
});
