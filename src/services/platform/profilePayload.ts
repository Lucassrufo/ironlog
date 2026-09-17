import { PlatformRole } from '../../types/platform';

export function sanitizeOwnProfilePayload(profile: { id: string; role: PlatformRole; name: string; email: string }) {
  const name = profile.name.trim();

  return {
    id: profile.id,
    role: profile.role,
    name: name.length >= 2 ? name.slice(0, 80) : 'Usuario IronLog',
    email: profile.email.trim().toLowerCase(),
  };
}
