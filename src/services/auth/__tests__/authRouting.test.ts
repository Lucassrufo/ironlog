import { describe, expect, test } from 'vitest';

import { getInitialRouteForAuthState } from '../authRouting';

describe('auth routing', () => {
  test('routes missing Supabase config to setup', () => {
    expect(getInitialRouteForAuthState({ configured: false, profile: null, sessionUserId: null })).toBe('SupabaseSetup');
  });

  test('routes unauthenticated configured users to auth landing', () => {
    expect(getInitialRouteForAuthState({ configured: true, profile: null, sessionUserId: null, profileStatus: 'idle' })).toBe('AuthLanding');
  });

  test('routes authenticated users without a profile to profile completion', () => {
    expect(getInitialRouteForAuthState({ configured: true, profile: null, sessionUserId: 'user-1', profileStatus: 'missing' })).toBe(
      'CompleteOAuthProfile',
    );
  });

  test('routes trainers to trainer portal', () => {
    expect(getInitialRouteForAuthState({
      configured: true,
      sessionUserId: 'trainer-1',
      profileStatus: 'ready',
      profile: { id: 'trainer-1', role: 'trainer', name: 'Treinador' },
    })).toBe('TrainerDashboard');
  });

  test('routes students to dashboard', () => {
    expect(getInitialRouteForAuthState({
      configured: true,
      sessionUserId: 'student-1',
      profileStatus: 'ready',
      profile: { id: 'student-1', role: 'student', name: 'Aluno' },
    })).toBe('Dashboard');
  });
});
