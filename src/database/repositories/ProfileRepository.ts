import { getDatabase } from '../database';

export type LocalUserProfile = {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  photo: string | null;
  bio: string | null;
  emailVerified: boolean;
};

export async function getProfile(): Promise<LocalUserProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: string; username: string | null; name: string | null; email: string | null;
    photo: string | null; bio: string | null; email_verified: number;
  }>('SELECT id, username, name, email, photo, bio, email_verified FROM user_profile LIMIT 1');
  return row ? {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    photo: row.photo,
    bio: row.bio,
    emailVerified: row.email_verified === 1,
  } : null;
}

export async function upsertProfile(profile: LocalUserProfile): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO user_profile (id, username, name, email, photo, bio, email_verified, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       username = excluded.username, name = excluded.name, email = excluded.email,
       photo = excluded.photo, bio = excluded.bio, email_verified = excluded.email_verified,
       updated_at = excluded.updated_at`,
    profile.id,
    profile.username,
    profile.name,
    profile.email,
    profile.photo,
    profile.bio,
    profile.emailVerified ? 1 : 0,
    now,
    now,
  );
}

export async function clearProfileCache(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM user_profile');
}
