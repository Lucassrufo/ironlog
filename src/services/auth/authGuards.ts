import { PlatformRole } from '../../types/platform';

type OAuthUserLike = {
  id?: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    role?: unknown;
  };
};

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateStrongPassword(password: string) {
  const missing: string[] = [];

  if (password.length < 10) {
    missing.push('pelo menos 10 caracteres');
  }

  if (!/[A-ZÀ-Ý]/.test(password)) {
    missing.push('uma letra maiuscula');
  }

  if (!/[a-zà-ÿ]/.test(password)) {
    missing.push('uma letra minuscula');
  }

  if (!/\d/.test(password)) {
    missing.push('um numero');
  }

  return {
    isValid: missing.length === 0,
    message:
      missing.length === 0
        ? ''
        : `Use uma senha com ${missing.join(', ')}. Isso reduz risco de acesso indevido sem custo adicional.`,
  };
}

export function coercePlatformRole(value: unknown): PlatformRole | null {
  return value === 'trainer' || value === 'student' ? value : null;
}

export function buildOAuthRedirectTo(href?: string) {
  if (!href) {
    return undefined;
  }

  try {
    const url = new URL(href);
    return url.origin;
  } catch {
    return undefined;
  }
}

export function deriveOAuthProfileDraft(user: OAuthUserLike, role: PlatformRole) {
  if (!user.id || !user.email) {
    return null;
  }

  const email = normalizeAuthEmail(user.email);
  const metadataName = user.user_metadata?.full_name ?? user.user_metadata?.name;
  const fallbackName = email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'Usuario IronLog';
  const name = (metadataName?.trim() || fallbackName).slice(0, 80);

  return {
    id: user.id,
    email,
    name,
    role,
  };
}

export function deriveProfileFromAuthUser(user: OAuthUserLike) {
  const role = coercePlatformRole(user.user_metadata?.role);

  if (!role) {
    return null;
  }

  return deriveOAuthProfileDraft(user, role);
}

export function getSafeAuthErrorMessage(error: unknown) {
  if (error instanceof Error && /unsupported provider|provider is not enabled/i.test(error.message)) {
    return 'O login com Google ainda nao foi habilitado no Supabase. Ative o provider Google em Authentication > Providers antes de usar este botao.';
  }

  if (error instanceof Error && /row-level security|violates row-level security|permission denied/i.test(error.message)) {
    return 'O banco ainda nao liberou esta acao. Execute as migrations mais recentes no Supabase e tente novamente.';
  }

  if (error instanceof Error && /duplicate key|unique constraint/i.test(error.message)) {
    return 'Esta conta ja tem um perfil criado. Saia, entre novamente e tente liberar o acesso de novo.';
  }

  if (error instanceof Error && /email not confirmed|not confirmed/i.test(error.message)) {
    return 'Seu email ainda nao foi confirmado. Abra o email do IronLog e clique no link antes de entrar.';
  }

  if (error instanceof Error && /invalid login credentials|invalid credentials|user not found/i.test(error.message)) {
    return 'Email ou senha nao conferem. Se voce acabou de criar a conta, confirme o email primeiro.';
  }

  if (error instanceof Error && /password/i.test(error.message)) {
    return 'Revise os dados informados e tente novamente.';
  }

  if (error instanceof Error && /email/i.test(error.message)) {
    return 'Revise os dados informados e tente novamente.';
  }

  return error instanceof Error ? error.message : 'Tente novamente em alguns instantes.';
}

export function getRegistrationOutcome(data: { session: unknown | null; user?: { id?: string } | null }) {
  return {
    needsEmailConfirmation: Boolean(data.user?.id && !data.session),
    message: data.user?.id && !data.session ? 'Conta criada. Confirme seu email antes de fazer login.' : 'Conta criada.',
  };
}
