# Activity Detail View: Product Specification

## 1. Product brief

**Problem:** Recorded activities currently expose a limited summary and do not provide a complete, synchronized view of route, performance, splits, social context, or recorded streams.

**Users:** Athletes reviewing a completed run, coaches inspecting sessions, and owners maintaining private activity records.

**Success metrics:**
- Under 1.5 seconds to first meaningful activity summary on a mid-range 4G device.
- Under 3 seconds to a fully interactive three-hour, 1 Hz activity.
- 95% of detail-view sessions reach the map and at least one performance section.
- Privacy incidents involving hidden regions: zero.

**Non-goals:** Building a backend segment database, external fitness-device ingestion, or a paid-subscription system in this MVP.

## 2. Information architecture

| Breakpoint | Layout |
|---|---|
| Desktop | Sticky title/header, left route and summary, right charts/splits/zones. |
| Tablet | One primary column with collapsible sections and anchor sub-navigation. |
| Mobile | Vertical summary, map, charts, splits, zones, segments, media, social, raw data, and actions. |

Required section order:
1. Header and owner
2. Core summary
3. Route map
4. Performance charts
5. Splits and laps
6. Zones
7. Segments and achievements
8. Media and notes
9. Social
10. Raw data and export
11. Owner management

Anchor hashes: `#summary`, `#map`, `#pace`, `#splits`, `#zones`, `#segments`, `#media`, `#social`, `#raw`.

## 3. Component breakdown

| Component | Responsibility | States |
|---|---|---|
| `ActivityDetail` | Owns detail layout and selected range. | loading, ready, unavailable, offline |
| `ActivityHeader` | Title, type, owner, source, visibility, actions. | owner/viewer |
| `SummaryGrid` | Core and derived metrics. | complete, partial, empty |
| `TrackingMap` | Route, privacy-safe start/end, markers. | no GPS, loading, ready |
| `StreamChart` | Pace, HR, power, cadence, grade, elevation. | raw/light/heavy smoothing, selected/unselected |
| `SplitsTable` | Sortable split and lap rows. | kilometer/mile, empty |
| `ZonesSection` | Zone totals and stacked bars. | available/default/none |
| `SegmentEfforts` | Matched efforts and achievements. | matched/none/unavailable |
| `SocialSection` | Kudos and comments. | authorized/read-only/empty |
| `RawDataTable` | Timestamped samples and export. | available/partial/none |

## 4. Data model

```ts
type Activity = {
  id: string;
  ownerId: string;
  title: string;
  sportType: 'run' | 'ride' | 'swim' | 'hike' | 'workout';
  visibility: 'everyone' | 'followers' | 'only_me';
  startedAt: number;
  endedAt?: number;
  distanceMeters: number;
  movingSeconds: number;
  elapsedSeconds: number;
  status: 'draft' | 'recording' | 'finished';
};

type Stream = {
  activityId: string;
  timeSeconds: number[];
  latitude?: number[];
  longitude?: number[];
  altitude?: number[];
  heartRate?: number[];
  power?: number[];
  cadence?: number[];
  grade?: number[];
};

type Lap = { id: string; activityId: string; index: number; startedTime: number; durationSeconds: number; distanceMeters: number };
type Split = { lapIndex: number; distanceMeters: number; elapsedSeconds: number; elevationMeters: number; heartRate?: number; power?: number };
type SegmentEffort = { id: string; segmentId: string; activityId: string; elapsedSeconds: number; rank?: number; isPr: boolean };
type Media = { id: string; activityId: string; uri: string; caption?: string; latitude?: number; longitude?: number };
type Kudos = { activityId: string; userId: string; createdAt: number };
type Comment = { id: string; activityId: string; authorId: string; body: string; parentId?: string; createdAt: number };
type Privacy = { hiddenStartMeters: number; hiddenEndMeters: number; visibility: Activity['visibility'] };
```

Cardinality: one activity has many streams/laps/splits/efforts/media/kudos/comments; one comment may have many replies; one owner has many activities.

## 5. API specification

| Endpoint | Purpose | Pagination/cache |
|---|---|---|
| `GET /activities/:id/summary` | Header and core metrics | 5-minute cache, version key |
| `GET /activities/:id/streams` | Time-indexed streams | Range/cursor, immutable raw key |
| `GET /activities/:id/laps` | Laps and splits | Cached; invalidated on edit |
| `GET /activities/:id/segments` | Segment efforts | Cached server result |
| `GET /activities/:id/social` | Kudos and comments | Kudos count cached; comments cursor |
| `GET /activities/:id/media` | Photos and video | CDN URLs, cursor |
| `POST /activities/:id/export` | Authorized privacy-aware export | Rate limited |

Example summary:

```json
{
  "id": "a_123",
  "title": "Morning Run",
  "sportType": "run",
  "visibility": "everyone",
  "distanceMeters": 10500,
  "movingSeconds": 1584,
  "elapsedSeconds": 1604,
  "elevationGainMeters": 50,
  "streamsAvailable": ["position", "altitude"],
  "version": 3
}
```

Errors: `401 unauthorized`, `403 forbidden/private`, `404 unavailable`, `409 stale version`, `429 rate limited`, `503 streams unavailable`. Authorization must run on every endpoint.

## 6. Metric formulas

| Metric | Formula | Notes |
|---|---|---|
| Distance | Sum haversine segment distance | Filter GPS implausible jumps separately |
| Moving time | Accumulated time while accepted movement threshold is met | Preserve paused intervals |
| Avg pace | Elapsed or moving seconds / km | Label whether elapsed or moving |
| Elevation gain | Sum positive altitude deltas after smoothing | Do not mutate raw altitude |
| Avg heart rate | Arithmetic mean of valid samples | Exclude null/outlier values |
| Avg speed | Distance / moving seconds | Unit conversion only at presentation |
| Grade | `(end elevation - start elevation) / horizontal distance * 100` | Smooth long-distance noise |
| Normalized power | Rolling 30-second power fourth-root mean | Server-computed, versioned |

## 7. Implementation phases

### MVP
- Summary, route, no-data states, split table, pace chart.
- Mobile activity cards and detail navigation.
- Local SQLite persistence and privacy-safe raw point display.

### Phase 2
- Stream chart ranges, smoothing, zones, segment efforts, media, gear and source.
- Summary and stream API endpoints.
- Server-side zone/split computation.

### Phase 3
- Kudos/comments, export formats, sharing, owner management, audit trails.
- Offline cache and stale-data states.
- Full accessibility and privacy test automation.

## 8. Testing and acceptance

- Unit tests: distance, pace, elevation, zones, split boundaries, null/extreme streams.
- Integration tests: all endpoint authorization and stale-cache cases.
- Visual tests: mobile 390x844, tablet 768, desktop 1440.
- E2E: open card, scrub, sync cursor, export, kudos, edit title.
- Privacy tests: hidden start/end excluded from DOM, API, maps, streams, and exports.
- Load tests: 10 hours at 1 Hz and 1 hour at 10 Hz.
- Accessibility: WCAG 2.2 AA automated and manual screen-reader checks.

## 9. Assumptions

- This MVP is a local-first Expo app, not a multi-user fitness backend.
- Google profile is optional and activities remain local to the device.
- GPS points are the only stream currently persisted.
- No server currently exists to perform authorization, segment matching, or exports.
- `everyone` is only a client label until server-backed privacy is implemented.
- Real heart-rate, power, cadence, weather, media, segments, and social data require native sensors or third-party integrations.

## 10. Risks and open questions

- OAuth client configuration is not yet supplied.
- Backend ownership and cloud sync are not defined.
- Hidden-zone rules need an exact privacy algorithm and locale/timezone policy.
- react-native-maps styling and provider behavior vary between platforms.
- Device/stream schemas must be defined before third-party ingestion.
- Export formats require a server or on-device formatter with privacy filtering.
