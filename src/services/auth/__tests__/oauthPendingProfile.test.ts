import { describe, expect, it } from 'vitest';

import { parsePendingOAuthProfile, serializePendingOAuthProfile } from '../oauthPendingProfile';

describe('oauthPendingProfile', () => {
  it('round-trips a fresh OAuth profile choice', () => {
    const payload = serializePendingOAuthProfile({ role: 'trainer', name: 'Coach Iron' }, 1000);

    expect(parsePendingOAuthProfile(payload, 1000 + 60_000)).toEqual({
      role: 'trainer',
      name: 'Coach Iron',
    });
  });

  it('rejects stale or tampered OAuth profile choices', () => {
    expect(parsePendingOAuthProfile(serializePendingOAuthProfile({ role: 'student' }, 1000), 1000 + 31 * 60_000)).toBeNull();
    expect(parsePendingOAuthProfile('{"role":"admin","createdAt":1000}', 1000)).toBeNull();
  });
});
