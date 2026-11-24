# Database migrations

Stride uses Expo SQLite `PRAGMA user_version` with ordered migrations in
`src/database/migrations/index.ts`.

## Migration rules

- Read `PRAGMA user_version` during database initialization.
- Run only migrations newer than the current version.
- Execute each migration in `db.withTransactionAsync`.
- Set `PRAGMA user_version` only after the migration SQL succeeds.
- Never delete or recreate the database as a migration strategy.
- Reopening the app safely retries only incomplete work.

## Original database migration

Migration 2 upgrades databases created with the original `activities`,
`gps_points`, and `user_profile` tables:

- Existing IDs and GPS coordinates are preserved.
- GPS points receive deterministic sequence numbers ordered by timestamp,
  then original GPS point ID.
- Missing GPS `created_at` values use the original timestamp.
- Existing activities retain their timestamps and metrics.
- Legacy `finished` activity status is converted to `completed`.
- Legacy profiles retain ID, name, email, and photo.
- New fields receive safe defaults.
- All new tables and indexes are created without deleting existing rows.

## Adding a migration

1. Add a migration module in `src/database/migrations/`.
2. Export it with a monotonically increasing version.
3. Add it to the `migrations` array.
4. Test against both an original-schema database and an empty database.

## Rollback limitations

Expo SQLite transactions roll back SQL statements in a failed migration.
SQLite `ALTER TABLE` statements are transactional in supported migration
contexts, but a migration must still be designed with additive, data-preserving
SQL where possible.
