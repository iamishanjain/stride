# Stride

Stride is an Expo/React Native foundation for an offline-first GPS running tracker.

## What is implemented

- Idle, recording, paused, finishing, and finished tracking states with guarded controls.
- Foreground GPS subscription with permission handling, accuracy reporting, duplicate/timestamp checks, movement thresholds, jump detection, and speed plausibility checks.
- Haversine distance accumulation, elapsed time excluding pauses, average pace, and average speed.
- Live route polyline, current-location map following, start/finish markers, and a finished-run summary.
- SQLite persistence for activity metadata and ordered GPS points using WAL mode and an index.
- A registered Expo Task Manager background-location extension point. The foreground engine remains the source of truth in this milestone.
- Unit tests covering distance, jitter/jumps, timestamps, pace, duration, and empty runs.

## Run locally

```bash
npm install
npm start
```

Use `i` for iOS Simulator or `a` for Android Emulator. Location tracking should be tested on a physical device for realistic GPS behavior.

## Development builds

Native location behavior, map rendering, SQLite, and any background behavior should be validated with a development build rather than Expo Go:

```bash
npx expo install
npx expo run:ios
npx expo run:android
```

For EAS builds, install/configure EAS CLI and run `eas build --profile development`.

## Quality checks

```bash
npm run typecheck
npm test -- --runInBand
```

## Known limitations and next steps

- Background updates are registered but are not yet wired into the durable recording pipeline. iOS and Android background execution require a development build, platform permission review, and physical-device testing.
- The app currently exposes one tracker screen; activity history, migrations, sync, crash recovery, split calculations, and richer recent-pace smoothing are future milestones.
- GPS filtering is intentionally conservative: accuracy over 80 m, movement under 3 m, jumps over 250 m, or speeds over 15 m/s are ignored. These thresholds should be tuned with device data.
- SQLite writes happen at finish for this first milestone. A production background-capable implementation should enqueue each accepted point and recover unfinished activities on launch.
