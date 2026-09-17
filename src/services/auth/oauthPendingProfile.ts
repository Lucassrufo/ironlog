import AsyncStorage from '@react-native-async-storage/async-storage';

import { PlatformRole } from '../../types/platform';
import { coercePlatformRole } from './authGuards';

const PENDING_OAUTH_PROFILE_KEY = '@ironlog/pending-oauth-profile';
const PENDING_OAUTH_MAX_AGE_MS = 30 * 60 * 1000;

type PendingOAuthProfile = {
  role: PlatformRole;
  name?: string;
};

export function serializePendingOAuthProfile(profile: PendingOAuthProfile, createdAt = Date.now()) {
  return JSON.stringify({
    role: profile.role,
    name: profile.name?.trim().slice(0, 80) || undefined,
    createdAt,
  });
}

export function parsePendingOAuthProfile(value: string | null | undefined, now = Date.now()): PendingOAuthProfile | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as { role?: unknown; name?: unknown; createdAt?: unknown };
    const role = coercePlatformRole(parsed.role);
    const createdAt = typeof parsed.createdAt === 'number' ? parsed.createdAt : 0;

    if (!role || now - createdAt > PENDING_OAUTH_MAX_AGE_MS) {
      return null;
    }

    return {
      role,
      name: typeof parsed.name === 'string' ? parsed.name.trim().slice(0, 80) : undefined,
    };
  } catch {
    return null;
  }
}

export async function savePendingOAuthProfile(profile: PendingOAuthProfile) {
  await AsyncStorage.setItem(PENDING_OAUTH_PROFILE_KEY, serializePendingOAuthProfile(profile));
}

export async function readPendingOAuthProfile() {
  return parsePendingOAuthProfile(await AsyncStorage.getItem(PENDING_OAUTH_PROFILE_KEY));
}

export async function clearPendingOAuthProfile() {
  await AsyncStorage.removeItem(PENDING_OAUTH_PROFILE_KEY);
}
