import { PlatformRole } from '../../types/platform';
import { supabase } from '../supabase/client';
import { buildOAuthRedirectTo, getRegistrationOutcome, normalizeAuthEmail, validateStrongPassword } from './authGuards';
import { clearPendingOAuthProfile, savePendingOAuthProfile } from './oauthPendingProfile';

export async function registerWithProfile({
  email,
  password,
  name,
  role,
}: {
  email: string;
  password: string;
  name: string;
  role: PlatformRole;
}) {
  const normalizedEmail = normalizeAuthEmail(email);
  const passwordValidation = validateStrongPassword(password);

  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.message);
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: buildOAuthRedirectTo(typeof window !== 'undefined' ? window.location.href : undefined),
      data: {
        full_name: name,
        role,
      },
    },
  });

  if (error) {
    throw error;
  }

  const userId = data.user?.id;
  if (!userId) {
    throw new Error('Cadastro criado, mas o usuario ainda nao foi retornado pelo Supabase.');
  }

  return {
    ...data,
    registration: getRegistrationOutcome(data),
  };
}

export async function resendSignupConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalizeAuthEmail(email),
    options: {
      emailRedirectTo: buildOAuthRedirectTo(typeof window !== 'undefined' ? window.location.href : undefined),
    },
  });

  if (error) {
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeAuthEmail(email), password });

  if (error) {
    throw error;
  }

  return data;
}

export async function loginWithGoogle(profileChoice?: { role: PlatformRole; name?: string }) {
  if (profileChoice) {
    await savePendingOAuthProfile(profileChoice);
  } else {
    await clearPendingOAuthProfile();
  }

  const href = typeof window !== 'undefined' ? window.location.href : undefined;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: buildOAuthRedirectTo(href),
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
