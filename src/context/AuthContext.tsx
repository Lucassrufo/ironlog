import { Session } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { PlatformProfile, PlatformRole } from '../types/platform';
import { coercePlatformRole, deriveOAuthProfileDraft, deriveProfileFromAuthUser } from '../services/auth/authGuards';
import { loginWithEmail, loginWithGoogle, logout, registerWithProfile } from '../services/auth/authService';
import { clearPendingOAuthProfile, readPendingOAuthProfile } from '../services/auth/oauthPendingProfile';
import { createOwnProfile, getProfile } from '../services/platform/profileService';
import { getSupabaseConfigState, supabase } from '../services/supabase/client';

interface AuthContextValue {
  isConfigured: boolean;
  isAuthLoading: boolean;
  profileStatus: 'idle' | 'loading' | 'ready' | 'missing';
  session: Session | null;
  platformProfile: PlatformProfile | null;
  localOnly: boolean;
  enableLocalMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; name: string; role: PlatformRole }) => Promise<{ needsEmailConfirmation: boolean; message: string }>;
  signInWithGoogle: (profileChoice?: { role: PlatformRole; name?: string }) => Promise<void>;
  completeOAuthProfile: (data: { name: string; role: PlatformRole }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function withAuthTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Tempo limite ao carregar perfil.')), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function mapDraftToPlatformProfile(draft: { id: string; role: PlatformRole; name: string; email: string }): PlatformProfile {
  return {
    id: draft.id,
    role: draft.role,
    name: draft.name,
    email: draft.email,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const config = getSupabaseConfigState();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<AuthContextValue['profileStatus']>('idle');
  const [session, setSession] = useState<Session | null>(null);
  const [platformProfile, setPlatformProfile] = useState<PlatformProfile | null>(null);
  const [localOnly, setLocalOnly] = useState(false);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user.id;
    if (!config.isConfigured || !userId) {
      setPlatformProfile(null);
      setProfileStatus('idle');
      return;
    }

    setProfileStatus('loading');
    let profile: PlatformProfile | null = null;

    try {
      profile = await getProfile(userId);
    } catch {
      const fallbackProfile = deriveProfileFromAuthUser(session.user);
      if (fallbackProfile) {
        setPlatformProfile(mapDraftToPlatformProfile(fallbackProfile));
        setProfileStatus('ready');
        return;
      }

      throw new Error('Nao foi possivel carregar o perfil.');
    }

    if (profile) {
      await clearPendingOAuthProfile();
      setPlatformProfile(profile);
      setProfileStatus('ready');
      return;
    }

    const pendingProfile = await readPendingOAuthProfile();
    if (pendingProfile) {
      const draft = deriveOAuthProfileDraft(session.user, pendingProfile.role);
      if (draft) {
        const createdProfile = await createOwnProfile({
          ...draft,
          name: pendingProfile.name?.trim() || draft.name,
        });
        await clearPendingOAuthProfile();
        setPlatformProfile(createdProfile);
        setProfileStatus('ready');
        return;
      }
    }

    const metadataRole = coercePlatformRole(session.user.user_metadata?.role);
    if (metadataRole) {
      const draft = deriveOAuthProfileDraft(session.user, metadataRole);
      if (draft) {
        const createdProfile = await createOwnProfile(draft);
        setPlatformProfile(createdProfile);
        setProfileStatus('ready');
        return;
      }
    }

    const fallbackProfile = deriveProfileFromAuthUser(session.user);
    if (fallbackProfile) {
      setPlatformProfile(mapDraftToPlatformProfile(fallbackProfile));
      setProfileStatus('ready');
      return;
    }

    setPlatformProfile(null);
    setProfileStatus('missing');
  }, [config.isConfigured, session]);

  useEffect(() => {
    if (!config.isConfigured) {
      setIsAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAuthLoading(false);
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.origin);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setPlatformProfile(null);
        setProfileStatus('idle');
      }
    });

    return () => data.subscription.unsubscribe();
  }, [config.isConfigured]);

  useEffect(() => {
    withAuthTimeout(refreshProfile()).catch(() => {
      const fallbackProfile = session?.user ? deriveProfileFromAuthUser(session.user) : null;
      if (fallbackProfile) {
        setPlatformProfile(mapDraftToPlatformProfile(fallbackProfile));
        setProfileStatus('ready');
        return;
      }

      setPlatformProfile(null);
      setProfileStatus(session ? 'missing' : 'idle');
    });
  }, [refreshProfile, session]);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await loginWithEmail(email, password);
    setSession(data.session);
  }, []);

  const signUp = useCallback(async (data: { email: string; password: string; name: string; role: PlatformRole }) => {
    const result = await registerWithProfile(data);
    setSession(result.session);
    return result.registration;
  }, []);

  const signInWithGoogle = useCallback(async (profileChoice?: { role: PlatformRole; name?: string }) => {
    await loginWithGoogle(profileChoice);
  }, []);

  const completeOAuthProfile = useCallback(
    async (data: { name: string; role: PlatformRole }) => {
      if (!session?.user) {
        throw new Error('Sessao nao encontrada. Entre novamente.');
      }

      const draft = deriveOAuthProfileDraft(session.user, data.role);
      if (!draft) {
        throw new Error('Nao foi possivel ler os dados da conta Google.');
      }

      const nextDraft = {
        ...draft,
        role: data.role,
        name: data.name.trim() || draft.name,
      };

      await supabase.auth.updateUser({
        data: {
          role: data.role,
          full_name: nextDraft.name,
        },
      });

      let profile: PlatformProfile;
      try {
        profile = await createOwnProfile(nextDraft);
      } catch {
        profile = mapDraftToPlatformProfile(nextDraft);
      }

      await clearPendingOAuthProfile();
      setPlatformProfile(profile);
      setProfileStatus('ready');
    },
    [session?.user],
  );

  const signOut = useCallback(async () => {
    await logout();
    setSession(null);
    setPlatformProfile(null);
    setProfileStatus('idle');
  }, []);

  const value = useMemo(
    () => ({
      isConfigured: config.isConfigured,
      isAuthLoading,
      profileStatus,
      session,
      platformProfile,
      localOnly,
      enableLocalMode: () => setLocalOnly(true),
      completeOAuthProfile,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      refreshProfile,
    }),
    [
      completeOAuthProfile,
      config.isConfigured,
      isAuthLoading,
      localOnly,
      platformProfile,
      profileStatus,
      refreshProfile,
      session,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
