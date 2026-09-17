import { describe, expect, it } from 'vitest';

import {
  buildOAuthRedirectTo,
  coercePlatformRole,
  deriveOAuthProfileDraft,
  deriveProfileFromAuthUser,
  getRegistrationOutcome,
  getSafeAuthErrorMessage,
  normalizeAuthEmail,
  validateStrongPassword,
} from '../authGuards';

describe('authGuards', () => {
  it('normalizes email before password authentication', () => {
    expect(normalizeAuthEmail('  ALUNO@IronLog.COM  ')).toBe('aluno@ironlog.com');
  });

  it('requires a stronger password for new email accounts', () => {
    expect(validateStrongPassword('abc123').isValid).toBe(false);
    expect(validateStrongPassword('Ironlog2026').isValid).toBe(true);
  });

  it('rejects invalid roles from OAuth pending state', () => {
    expect(coercePlatformRole('trainer')).toBe('trainer');
    expect(coercePlatformRole('student')).toBe('student');
    expect(coercePlatformRole('admin')).toBeNull();
  });

  it('builds a local OAuth redirect without trusting arbitrary paths', () => {
    expect(buildOAuthRedirectTo('http://localhost:8082/register')).toBe('http://localhost:8082');
    expect(buildOAuthRedirectTo(undefined)).toBeUndefined();
  });

  it('derives a safe profile draft from OAuth identity data', () => {
    expect(
      deriveOAuthProfileDraft(
        {
          id: 'user-1',
          email: ' Pessoa@Example.com ',
          user_metadata: {
            full_name: ' Pessoa Iron ',
          },
        },
        'student',
      ),
    ).toEqual({
      id: 'user-1',
      email: 'pessoa@example.com',
      name: 'Pessoa Iron',
      role: 'student',
    });
  });

  it('derives a portal profile from Supabase Auth metadata when public profile is unavailable', () => {
    expect(
      deriveProfileFromAuthUser({
        id: 'user-1',
        email: ' Treinador@IronLog.com ',
        user_metadata: {
          role: 'trainer',
          full_name: 'Coach Iron',
        },
      }),
    ).toEqual({
      id: 'user-1',
      email: 'treinador@ironlog.com',
      name: 'Coach Iron',
      role: 'trainer',
    });
  });

  it('explains when Google OAuth is not enabled in Supabase', () => {
    expect(getSafeAuthErrorMessage(new Error('Unsupported provider: provider is not enabled'))).toBe(
      'O login com Google ainda nao foi habilitado no Supabase. Ative o provider Google em Authentication > Providers antes de usar este botao.',
    );
  });

  it('detects signups waiting for email confirmation', () => {
    expect(getRegistrationOutcome({ session: null, user: { id: 'user-1' } })).toEqual({
      needsEmailConfirmation: true,
      message: 'Conta criada. Confirme seu email antes de fazer login.',
    });

    expect(getRegistrationOutcome({ session: { access_token: 'token' }, user: { id: 'user-1' } })).toEqual({
      needsEmailConfirmation: false,
      message: 'Conta criada.',
    });
  });
});
