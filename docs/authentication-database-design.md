# Authentication database design

The mobile database is not an authentication authority. It does not store
passwords, password hashes, Google access tokens, refresh tokens or other
authentication secrets.

## Local profile cache

`user_profile` stores a backend user ID when authenticated, display profile
fields and verification state. It can be updated or cleared independently of
the activity database.

## Future backend

A future backend PostgreSQL schema should include:

- `users`: stable ID, username, email, verification status and timestamps.
- `user_profiles`: display name, photo and bio.
- `auth_identities`: provider, provider subject, optional password hash and timestamps.
- `auth_sessions`: user, device and expiry/revocation fields.
- `refresh_tokens`: session, token hash, expiry and revocation fields.

Password identities may use Argon2id or another properly configured password
hash. Google identities must use Google's verified `sub` subject. One account
can have multiple identities, but linking accounts must use secure verification
rather than email matching alone.

Sensitive tokens should use platform secure storage. Refresh token rotation,
reuse detection and server-side revocation belong to a future backend.
