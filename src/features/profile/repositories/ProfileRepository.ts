import { getDatabase } from '../../../database/database';
import { GoogleProfile } from '../types/profile.types';

export async function getGoogleProfile(): Promise<GoogleProfile | null> {
  const db = await getDatabase();
  const profile = await db.getFirstAsync<{
    id: string;
    name: string | null;
    email: string | null;
    photo: string | null;
  }>('SELECT id, name, email, photo FROM user_profile LIMIT 1');
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name ?? 'Runner',
    email: profile.email ?? '',
    photo: profile.photo,
  };
}

export async function saveGoogleProfile(profile: GoogleProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO user_profile (id, name, email, photo) VALUES (?, ?, ?, ?)',
    profile.id,
    profile.name,
    profile.email,
    profile.photo,
  );
}
