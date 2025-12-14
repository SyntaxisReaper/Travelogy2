# Tourism Intelligence (Rajasthan) — Demo data, ingestion, and templates

## What this folder contains
- `hotel_registry_template.csv`: blank template for hotel registry imports.
- `hotel_registry_sample.csv`: a small example dataset.
- `hotel_snapshot_template.csv`: blank template for periodic hotel availability snapshots.
- `hotel_snapshot_sample.csv`: a small example snapshot file.

## Backend endpoints (overview)
Base path: `/api/tourism/`

### Metadata and directories
- `GET /api/tourism/meta/`
- `GET/POST /api/tourism/districts/`
- `GET/POST /api/tourism/attractions/`
- `GET /api/tourism/attractions/<id>/`
- `GET/POST /api/tourism/sources/` (create/manage IoT/CV/ticket sources per attraction)
- `GET /api/tourism/sources/<id>/`
- `GET/POST /api/tourism/entry_points/`
- `GET /api/tourism/entry_points/<id>/`
- `GET/POST /api/tourism/hotels/`

### Footfall analytics
- `POST /api/tourism/ingest/footfall/` (hashed tokens)
- `GET /api/tourism/footfall/live/?minutes=30&district_id=`
- `GET /api/tourism/footfall/presence/?district_id=&attraction_id=&start=&end=` (direction-aware in/out net delta)
- `GET /api/tourism/footfall/timeseries/?attraction_id=&district_id=&start=&end=`

### Arrivals into Rajasthan (entry analytics)
- `POST /api/tourism/ingest/entry/` (hashed tokens)
- `GET /api/tourism/entry/live/?minutes=30&district_id=`
- `GET /api/tourism/entry/timeseries/?entry_point_id=&district_id=&start=&end=`

### Hotel analytics
- CSV ingestion
  - `POST /api/tourism/ingest/hotels/registry_csv/` (multipart form field: `file`)
  - `POST /api/tourism/ingest/hotels/snapshot_csv/` (multipart form field: `file`)
- Read APIs
  - `GET /api/tourism/hotels/snapshots/?hotel_id=&district_id=&start=&end=`
  - `GET /api/tourism/hotels/utilization/?district_id=&start=&end=`

### Insights
- `GET /api/tourism/insights/overview/?district_id=&days=14&live_minutes=60`
  - includes `peak_hours`, `peak_weekdays`, `daily_totals` and `peak_days`
- `GET /api/tourism/insights/gaps/?days=14`

## Device / sensor ingestion auth (optional)
Ingestion endpoints can be called by either:
- a normal authenticated user (JWT), or
- a device/service using a shared key.

To enable device-key mode, set:
- `TOURISM_DEVICE_API_KEY=<your_key>`

Then send this header:
- `X-Device-Key: <your_key>`

## Ingest payload examples
### Footfall ingest
`POST /api/tourism/ingest/footfall/`
- `source_id`: integer
- `ts`: ISO datetime
- `visitor_type`: `domestic|international|unknown`
- `direction`: `in|out`
- `visitor_hashes`: list of hashed tokens

### Entry ingest (arrivals)
`POST /api/tourism/ingest/entry/`
- `entry_point_id`: integer
- `ts`: ISO datetime
- `visitor_type`: `domestic|international|unknown`
- `visitor_hashes`: list of hashed tokens

## Seeding demo data (recommended for first run)
After migrations, run:
- `python backend/manage.py seed_tourism_demo`

Optional:
- `python backend/manage.py seed_tourism_demo --wipe` (clear and reseed)
- `python backend/manage.py seed_tourism_demo --days 3` (more history)

This seeds:
- Rajasthan districts
- Entry points + entry visits (arrivals) in 5-minute buckets
- Sample attractions + one demo source per attraction
- Hotels + availability snapshots
- Footfall visits in 5-minute buckets using hashed visitor tokens

## Data retention helper
To purge raw visit events older than N days:
- `python backend/manage.py purge_tourism_visits --days 30`
- `python backend/manage.py purge_tourism_visits --days 30 --dry-run`

Then open:
- Frontend: `/ti/dashboard`, `/ti/footfall`, `/ti/attractions`, `/ti/hotels`, `/ti/insights`
