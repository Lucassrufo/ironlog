import { PlatformProfile } from '../../types/platform';
import { RootStackParamList } from '../../types/navigation';

export function getInitialRouteForAuthState({
  configured,
  profile,
  sessionUserId,
  profileStatus = 'idle',
}: {
  configured: boolean;
  profile: Pick<PlatformProfile, 'id' | 'role' | 'name'> | null;
  sessionUserId: string | null;
  profileStatus?: 'idle' | 'loading' | 'ready' | 'missing';
}): keyof RootStackParamList {
  if (!configured) {
    return 'SupabaseSetup';
  }

  if (!sessionUserId) {
    return 'AuthLanding';
  }

  if (!profile && profileStatus === 'missing') {
    return 'CompleteOAuthProfile';
  }

  if (!profile) {
    return 'AuthLoading';
  }

  return profile.role === 'trainer' ? 'TrainerDashboard' : 'Dashboard';
}
