# Stride local database architecture

Stride uses Expo SQLite in WAL mode as an offline-first local database.
`getDatabase()` owns connection reuse and concurrent initialization, enables
foreign keys and runs ordered migrations before returning a database handle.

## Core tables

- `activities`: activity ownership, lifecycle, metrics and local-date metadata.
- `gps_points`: ordered GPS route points with sequence and segment numbers.
- `activity_pause_intervals`: pause/resume history.
- `activity_splits`: derived ordered split metrics.
- `user_profile`: local cached profile, never an authentication authority.
- `app_settings`: lightweight preferences.
- `sync_queue`: future backend synchronization records.

## Repository boundaries

React UI and hooks must use repositories rather than direct SQL. The database
package contains activity, GPS, pause, split, profile, settings, and sync
repositories. GPS detail loading is separate from activity history loading:
history queries do not load complete route data.

## Transactions

Use `withTransactionAsync` for activity creation/completion, batch GPS inserts,
pause/resume transitions, split batches, activity deletion and future sync
queue creation.

## Offline and future synchronization

Activities and GPS points are local-first and do not require network access.
The nullable `user_id` supports anonymous activities and explicit future account
assignment. `sync_queue` records future create/update/delete operations without
implementing a network worker.

## Authentication-ready design

Password hashes and authentication secrets belong outside SQLite. A future
backend should use PostgreSQL, while mobile profile caching remains in
`user_profile`. Google authentication identity should use the provider subject,
not an email address.

## Future backend

PostgreSQL/PostGIS is appropriate for server-side synchronization and
geospatial processing; Redis can support caching and rate limiting; object
storage can hold large exports or GPX assets. Social, analytics, routes and gear
domains should be introduced through future migrations, not as empty local
tables in this implementation.
