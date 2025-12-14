from __future__ import annotations

import csv
import io
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Tuple

from django.db.models import Count
from django.utils.dateparse import parse_datetime
from rest_framework import generics, permissions, status

from .permissions import IsAuthenticatedOrDeviceKey
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Attraction,
    District,
    EntryPoint,
    EntryVisit,
    FootfallSource,
    FootfallVisit,
    Hotel,
    HotelAvailabilitySnapshot,
)
from .serializers import (
    AttractionSerializer,
    DistrictSerializer,
    EntryPointSerializer,
    FootfallSourceSerializer,
    HotelSerializer,
    IngestEntrySerializer,
    IngestFootfallSerializer,
    HotelRegistryCsvUploadSerializer,
    HotelSnapshotCsvUploadSerializer,
)


def _floor_to_5min(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    epoch = int(dt.timestamp())
    floored = epoch - (epoch % 300)
    return datetime.fromtimestamp(floored, tz=timezone.utc)


def _parse_dt_param(v: str | None, default: datetime) -> datetime:
    if not v:
        return default
    parsed = parse_datetime(v)
    if parsed is None:
        return default
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


class MetaView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        districts = District.objects.order_by('name')
        types = [
            {'key': k, 'label': v}
            for k, v in Attraction.ATTRACTION_TYPES
        ]
        return Response({
            'districts': DistrictSerializer(districts, many=True).data,
            'attraction_types': types,
            'bucket_seconds': 300,
        })


class DistrictListView(generics.ListCreateAPIView):
    queryset = District.objects.all().order_by('name')
    serializer_class = DistrictSerializer
    permission_classes = [permissions.IsAuthenticated]


class AttractionListCreateView(generics.ListCreateAPIView):
    queryset = Attraction.objects.select_related('district').all().order_by('district__name', 'name')
    serializer_class = AttractionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        district_id = self.request.query_params.get('district_id')
        attraction_type = self.request.query_params.get('attraction_type')
        q = self.request.query_params.get('q')
        if district_id:
            qs = qs.filter(district_id=district_id)
        if attraction_type:
            qs = qs.filter(attraction_type=attraction_type)
        if q:
            qs = qs.filter(name__icontains=q)
        return qs


class AttractionDetailView(generics.RetrieveAPIView):
    queryset = Attraction.objects.select_related('district').all()
    serializer_class = AttractionSerializer
    permission_classes = [permissions.IsAuthenticated]


class FootfallSourceListCreateView(generics.ListCreateAPIView):
    queryset = FootfallSource.objects.select_related('attraction', 'attraction__district').all().order_by('attraction__district__name', 'attraction__name', 'name')
    serializer_class = FootfallSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        attraction_id = self.request.query_params.get('attraction_id')
        source_type = self.request.query_params.get('source_type')
        if attraction_id:
            qs = qs.filter(attraction_id=attraction_id)
        if source_type:
            qs = qs.filter(source_type=source_type)
        return qs


class FootfallSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FootfallSource.objects.select_related('attraction', 'attraction__district').all()
    serializer_class = FootfallSourceSerializer
    permission_classes = [permissions.IsAuthenticated]


class EntryPointListCreateView(generics.ListCreateAPIView):
    queryset = EntryPoint.objects.select_related('district').all().order_by('district__name', 'name')
    serializer_class = EntryPointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        district_id = self.request.query_params.get('district_id')
        entry_type = self.request.query_params.get('entry_type')
        q = self.request.query_params.get('q')
        if district_id:
            qs = qs.filter(district_id=district_id)
        if entry_type:
            qs = qs.filter(entry_type=entry_type)
        if q:
            qs = qs.filter(name__icontains=q)
        return qs


class EntryPointDetailView(generics.RetrieveAPIView):
    queryset = EntryPoint.objects.select_related('district').all()
    serializer_class = EntryPointSerializer
    permission_classes = [permissions.IsAuthenticated]


class HotelListCreateView(generics.ListCreateAPIView):
    queryset = Hotel.objects.select_related('district').all().order_by('district__name', 'name')
    serializer_class = HotelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        district_id = self.request.query_params.get('district_id')
        q = self.request.query_params.get('q')
        if district_id:
            qs = qs.filter(district_id=district_id)
        if q:
            qs = qs.filter(name__icontains=q)
        return qs


class HotelSnapshotsView(APIView):
    """Read hotel availability snapshots.

    Query params:
    - hotel_id (optional)
    - district_id (optional)
    - start, end (optional ISO datetimes)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hotel_id = request.query_params.get('hotel_id')
        district_id = request.query_params.get('district_id')
        start = _parse_dt_param(request.query_params.get('start'), datetime.now(tz=timezone.utc) - timedelta(days=7))
        end = _parse_dt_param(request.query_params.get('end'), datetime.now(tz=timezone.utc))

        qs = HotelAvailabilitySnapshot.objects.select_related('hotel', 'hotel__district').filter(ts__gte=start, ts__lt=end)
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        if district_id:
            qs = qs.filter(hotel__district_id=district_id)

        out = []
        for s in qs.order_by('ts').iterator():
            total = s.rooms_total or s.hotel.rooms_total
            avail = s.rooms_available
            occ = None
            if total and avail is not None and total > 0:
                occ = max(0.0, min(1.0, 1.0 - (float(avail) / float(total))))
            out.append({
                'id': s.id,
                'hotel_id': s.hotel_id,
                'hotel_name': s.hotel.name,
                'district_id': s.hotel.district_id,
                'district': s.hotel.district.name,
                'ts': s.ts.isoformat(),
                'rooms_available': s.rooms_available,
                'rooms_total': total,
                'occupancy_ratio': occ,
                'source': s.source,
            })
        return Response(out)


def _rating_band(rating: float | None) -> str:
    if rating is None:
        return 'unknown'
    if rating < 3.0:
        return 'lt3'
    if rating < 4.0:
        return '3to4'
    if rating <= 5.0:
        return '4to5'
    return 'unknown'


class HotelUtilizationView(APIView):
    """Utilization rollups (district + rating band) based on snapshots.

    Query params:
    - district_id (optional)
    - start, end (optional ISO datetimes)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        district_id = request.query_params.get('district_id')
        start = _parse_dt_param(request.query_params.get('start'), datetime.now(tz=timezone.utc) - timedelta(days=7))
        end = _parse_dt_param(request.query_params.get('end'), datetime.now(tz=timezone.utc))

        hotels_qs = Hotel.objects.select_related('district').all()
        if district_id:
            hotels_qs = hotels_qs.filter(district_id=district_id)
        hotels = list(hotels_qs)
        hotel_by_id = {h.id: h for h in hotels}

        snaps = HotelAvailabilitySnapshot.objects.select_related('hotel', 'hotel__district').filter(ts__gte=start, ts__lt=end)
        if district_id:
            snaps = snaps.filter(hotel__district_id=district_id)

        # Aggregate occupancy observations per district and rating band
        district_stats: Dict[int, Dict[str, Any]] = {}
        band_stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {'snapshots': 0, 'occ_sum': 0.0, 'occ_count': 0})

        # Pre-seed districts with hotel capacity even if no snapshots
        for h in hotels:
            did = h.district_id
            if did not in district_stats:
                district_stats[did] = {
                    'district_id': did,
                    'district': h.district.name,
                    'hotels': 0,
                    'rooms_total_sum': 0,
                    'snapshots': 0,
                    'occupancy_avg': None,
                }
            district_stats[did]['hotels'] += 1
            if h.rooms_total:
                district_stats[did]['rooms_total_sum'] += int(h.rooms_total)

        for s in snaps.iterator():
            h = hotel_by_id.get(s.hotel_id) or s.hotel
            did = h.district_id
            if did not in district_stats:
                district_stats[did] = {
                    'district_id': did,
                    'district': h.district.name,
                    'hotels': 0,
                    'rooms_total_sum': 0,
                    'snapshots': 0,
                    'occupancy_avg': None,
                }

            total = s.rooms_total or h.rooms_total
            avail = s.rooms_available
            occ = None
            if total and avail is not None and total > 0:
                occ = max(0.0, min(1.0, 1.0 - (float(avail) / float(total))))

            district_stats[did]['snapshots'] += 1
            if occ is not None:
                # store rolling average fields
                prev_sum = district_stats[did].get('_occ_sum', 0.0)
                prev_count = district_stats[did].get('_occ_count', 0)
                district_stats[did]['_occ_sum'] = prev_sum + occ
                district_stats[did]['_occ_count'] = prev_count + 1

                band = _rating_band(h.rating)
                band_stats[band]['snapshots'] += 1
                band_stats[band]['occ_sum'] += occ
                band_stats[band]['occ_count'] += 1

        # finalize averages
        district_out = []
        for did, d in district_stats.items():
            cnt = int(d.pop('_occ_count', 0))
            sm = float(d.pop('_occ_sum', 0.0))
            d['occupancy_avg'] = (sm / cnt) if cnt > 0 else None
            district_out.append(d)

        district_out.sort(key=lambda x: (x['occupancy_avg'] is None, -(x['occupancy_avg'] or 0.0)))

        bands_out = []
        for band, b in band_stats.items():
            occ_avg = (b['occ_sum'] / b['occ_count']) if b['occ_count'] else None
            bands_out.append({
                'band': band,
                'snapshots': b['snapshots'],
                'occupancy_avg': occ_avg,
            })
        bands_out.sort(key=lambda x: x['band'])

        return Response({
            'window': {
                'start': start.isoformat(),
                'end': end.isoformat(),
            },
            'districts': district_out,
            'rating_bands': bands_out,
        })


class IngestFootfallView(APIView):
    """Ingest visitor hash events for an attraction source."""

    permission_classes = [IsAuthenticatedOrDeviceKey]

    def post(self, request):
        ser = IngestFootfallSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        source = FootfallSource.objects.get(id=data['source_id'])
        ts: datetime = data['ts']
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        hashes: List[str] = data['visitor_hashes']
        visitor_type = data['visitor_type']
        direction = data['direction']
        confidence = data.get('confidence')

        objs = [
            FootfallVisit(
                source=source,
                ts=ts,
                visitor_hash=h,
                visitor_type=visitor_type,
                direction=direction,
                confidence=confidence,
            )
            for h in hashes
        ]
        FootfallVisit.objects.bulk_create(objs, ignore_conflicts=True)

        return Response({'status': 'ok', 'ingested': len(objs)}, status=status.HTTP_201_CREATED)


class IngestEntryView(APIView):
    permission_classes = [IsAuthenticatedOrDeviceKey]

    def post(self, request):
        ser = IngestEntrySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        ep = EntryPoint.objects.get(id=data['entry_point_id'])
        ts: datetime = data['ts']
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        hashes: List[str] = data['visitor_hashes']
        visitor_type = data['visitor_type']

        objs = [
            EntryVisit(entry_point=ep, ts=ts, visitor_hash=h, visitor_type=visitor_type)
            for h in hashes
        ]
        EntryVisit.objects.bulk_create(objs, ignore_conflicts=True)
        return Response({'status': 'ok', 'ingested': len(objs)}, status=status.HTTP_201_CREATED)


class EntryTimeseriesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        entry_point_id = request.query_params.get('entry_point_id')
        district_id = request.query_params.get('district_id')
        start = _parse_dt_param(request.query_params.get('start'), datetime.now(tz=timezone.utc) - timedelta(days=7))
        end = _parse_dt_param(request.query_params.get('end'), datetime.now(tz=timezone.utc))

        qs = EntryVisit.objects.select_related('entry_point', 'entry_point__district').filter(ts__gte=start, ts__lt=end)
        if entry_point_id:
            qs = qs.filter(entry_point_id=entry_point_id)
        if district_id:
            qs = qs.filter(entry_point__district_id=district_id)

        rows = qs.values('ts', 'visitor_type', 'visitor_hash')
        bucket: Dict[Tuple[str, str], set] = defaultdict(set)
        for r in rows.iterator():
            b = _floor_to_5min(r['ts'])
            key = (b.isoformat(), r['visitor_type'])
            bucket[key].add(r['visitor_hash'])

        series_map: Dict[str, Dict[str, int]] = defaultdict(lambda: {'domestic': 0, 'international': 0, 'unknown': 0})
        for (b_iso, vtype), hashes in bucket.items():
            series_map[b_iso][vtype] = len(hashes)

        out = [
            {'bucket_start': b_iso, **counts}
            for b_iso, counts in sorted(series_map.items(), key=lambda x: x[0])
        ]
        return Response(out)


class EntryLiveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        minutes = int(request.query_params.get('minutes', '30'))
        start = datetime.now(tz=timezone.utc) - timedelta(minutes=minutes)

        qs = EntryVisit.objects.select_related('entry_point', 'entry_point__district').filter(ts__gte=start)
        district_id = request.query_params.get('district_id')
        if district_id:
            qs = qs.filter(entry_point__district_id=district_id)

        rows = qs.values('entry_point_id', 'entry_point__name', 'entry_point__district__name', 'ts', 'visitor_hash', 'visitor_type')

        bucketed: Dict[Tuple[int, str], Dict[str, set]] = defaultdict(lambda: {'domestic': set(), 'international': set(), 'unknown': set()})
        meta: Dict[int, Dict[str, Any]] = {}
        for r in rows.iterator():
            ep_id = r['entry_point_id']
            meta[ep_id] = {
                'entry_point_id': ep_id,
                'entry_point_name': r['entry_point__name'],
                'district': r['entry_point__district__name'],
            }
            b = _floor_to_5min(r['ts']).isoformat()
            vtype = r['visitor_type']
            if vtype not in ('domestic', 'international', 'unknown'):
                vtype = 'unknown'
            bucketed[(ep_id, b)][vtype].add(r['visitor_hash'])

        out = []
        for (ep_id, b), sets_by_type in bucketed.items():
            domestic = len(sets_by_type['domestic'])
            international = len(sets_by_type['international'])
            unknown = len(sets_by_type['unknown'])
            out.append({
                **meta.get(ep_id, {'entry_point_id': ep_id}),
                'bucket_start': b,
                'domestic': domestic,
                'international': international,
                'unknown': unknown,
                'unique_visitors': domestic + international + unknown,
            })

        out.sort(key=lambda x: (x['bucket_start'], x['unique_visitors']), reverse=True)
        return Response(out)


class FootfallTimeseriesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # filters
        attraction_id = request.query_params.get('attraction_id')
        district_id = request.query_params.get('district_id')
        start = _parse_dt_param(request.query_params.get('start'), datetime.now(tz=timezone.utc) - timedelta(days=7))
        end = _parse_dt_param(request.query_params.get('end'), datetime.now(tz=timezone.utc))

        qs = FootfallVisit.objects.select_related('source', 'source__attraction', 'source__attraction__district').filter(ts__gte=start, ts__lt=end)
        if attraction_id:
            qs = qs.filter(source__attraction_id=attraction_id)
        if district_id:
            qs = qs.filter(source__attraction__district_id=district_id)

        # Aggregate unique hashes per 5-min bucket, per visitor_type
        # DB-agnostic approach: pull only required fields.
        rows = qs.values('ts', 'visitor_type', 'visitor_hash')

        bucket: Dict[Tuple[str, str], set] = defaultdict(set)
        for r in rows.iterator():
            b = _floor_to_5min(r['ts'])
            key = (b.isoformat(), r['visitor_type'])
            bucket[key].add(r['visitor_hash'])

        # Build series
        series_map: Dict[str, Dict[str, int]] = defaultdict(lambda: {'domestic': 0, 'international': 0, 'unknown': 0})
        for (b_iso, vtype), hashes in bucket.items():
            series_map[b_iso][vtype] = len(hashes)

        out = [
            {'bucket_start': b_iso, **counts}
            for b_iso, counts in sorted(series_map.items(), key=lambda x: x[0])
        ]
        return Response(out)


class FootfallLiveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # last N minutes (default 30)
        minutes = int(request.query_params.get('minutes', '30'))
        start = datetime.now(tz=timezone.utc) - timedelta(minutes=minutes)

        qs = FootfallVisit.objects.select_related('source__attraction', 'source__attraction__district').filter(ts__gte=start)
        district_id = request.query_params.get('district_id')
        if district_id:
            qs = qs.filter(source__attraction__district_id=district_id)

        # Unique by (attraction, bucket, visitor_hash)
        rows = qs.values(
            'source__attraction_id',
            'source__attraction__name',
            'source__attraction__district__name',
            'source__attraction__capacity_per_5min',
            'source__attraction__crowd_threshold_warn',
            'source__attraction__crowd_threshold_critical',
            'ts',
            'visitor_hash',
        )

        bucketed: Dict[Tuple[int, str], set] = defaultdict(set)
        meta: Dict[int, Dict[str, Any]] = {}
        for r in rows.iterator():
            att_id = r['source__attraction_id']
            meta[att_id] = {
                'attraction_id': att_id,
                'attraction_name': r['source__attraction__name'],
                'district': r['source__attraction__district__name'],
                'capacity_per_5min': r.get('source__attraction__capacity_per_5min'),
                'crowd_threshold_warn': r.get('source__attraction__crowd_threshold_warn'),
                'crowd_threshold_critical': r.get('source__attraction__crowd_threshold_critical'),
            }
            b = _floor_to_5min(r['ts']).isoformat()
            bucketed[(att_id, b)].add(r['visitor_hash'])

        # Flatten to recent buckets
        out = []
        for (att_id, b), hashes in bucketed.items():
            m = meta.get(att_id, {'attraction_id': att_id})
            cap = m.get('capacity_per_5min')
            warn = m.get('crowd_threshold_warn')
            critical = m.get('crowd_threshold_critical')
            unique_visitors = len(hashes)

            utilization_ratio = None
            if cap and cap > 0:
                utilization_ratio = float(unique_visitors) / float(cap)

            crowd_status = 'unknown'
            if warn is not None or critical is not None or cap is not None:
                # derive defaults if thresholds missing
                if cap and warn is None:
                    warn = int(float(cap) * 0.75)
                if cap and critical is None:
                    critical = int(float(cap) * 0.9)

                if critical is not None and unique_visitors >= int(critical):
                    crowd_status = 'critical'
                elif warn is not None and unique_visitors >= int(warn):
                    crowd_status = 'warn'
                else:
                    crowd_status = 'normal'

            out.append({
                **m,
                'bucket_start': b,
                'unique_visitors': unique_visitors,
                'utilization_ratio': utilization_ratio,
                'crowd_status': crowd_status,
            })

        out.sort(key=lambda x: (x['bucket_start'], x['unique_visitors']), reverse=True)
        return Response(out)


class FootfallPresenceView(APIView):
    """Direction-aware live presence estimate.

    This endpoint uses `direction` (in/out) to compute net change per bucket and
    cumulative net change since `start`.

    Query params:
    - district_id (optional)
    - attraction_id (optional)
    - start, end (optional ISO datetimes; defaults to last 6 hours)

    Note: without a baseline "starting occupancy", `cumulative_net` is a *delta*
    since the chosen `start`.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attraction_id = request.query_params.get('attraction_id')
        district_id = request.query_params.get('district_id')

        now = datetime.now(tz=timezone.utc)
        start = _parse_dt_param(request.query_params.get('start'), now - timedelta(hours=6))
        end = _parse_dt_param(request.query_params.get('end'), now)

        qs = FootfallVisit.objects.select_related('source__attraction', 'source__attraction__district').filter(ts__gte=start, ts__lt=end)
        if attraction_id:
            qs = qs.filter(source__attraction_id=attraction_id)
        if district_id:
            qs = qs.filter(source__attraction__district_id=district_id)

        rows = qs.values(
            'source__attraction_id',
            'source__attraction__name',
            'source__attraction__district__name',
            'source__attraction__capacity_per_5min',
            'source__attraction__crowd_threshold_warn',
            'source__attraction__crowd_threshold_critical',
            'ts',
            'visitor_hash',
            'direction',
        )

        bucketed: Dict[Tuple[int, str], Dict[str, set]] = defaultdict(lambda: {'in': set(), 'out': set()})
        meta: Dict[int, Dict[str, Any]] = {}
        for r in rows.iterator():
            att_id = r['source__attraction_id']
            meta[att_id] = {
                'attraction_id': att_id,
                'attraction_name': r['source__attraction__name'],
                'district': r['source__attraction__district__name'],
                'capacity_per_5min': r.get('source__attraction__capacity_per_5min'),
                'crowd_threshold_warn': r.get('source__attraction__crowd_threshold_warn'),
                'crowd_threshold_critical': r.get('source__attraction__crowd_threshold_critical'),
            }

            b = _floor_to_5min(r['ts']).isoformat()
            direction = r.get('direction') or 'in'
            if direction not in ('in', 'out'):
                direction = 'in'
            bucketed[(att_id, b)][direction].add(r['visitor_hash'])

        # Build latest bucket per attraction + cumulative delta
        by_att: Dict[int, List[Tuple[str, int, int]]] = defaultdict(list)
        for (att_id, b_iso), sets_by_dir in bucketed.items():
            in_u = len(sets_by_dir['in'])
            out_u = len(sets_by_dir['out'])
            by_att[att_id].append((b_iso, in_u, out_u))

        out = []
        for att_id, buckets in by_att.items():
            buckets.sort(key=lambda x: x[0])
            cumulative = 0
            latest = None
            for (b_iso, in_u, out_u) in buckets:
                net = in_u - out_u
                cumulative += net
                latest = (b_iso, in_u, out_u, net, cumulative)

            if latest is None:
                continue

            (b_iso, in_u, out_u, net, cumulative) = latest
            m = meta.get(att_id, {'attraction_id': att_id})
            cap = m.get('capacity_per_5min')
            warn = m.get('crowd_threshold_warn')
            critical = m.get('crowd_threshold_critical')

            crowd_status = 'unknown'
            if warn is not None or critical is not None or cap is not None:
                if cap and warn is None:
                    warn = int(float(cap) * 0.75)
                if cap and critical is None:
                    critical = int(float(cap) * 0.9)
                if critical is not None and cumulative >= int(critical):
                    crowd_status = 'critical'
                elif warn is not None and cumulative >= int(warn):
                    crowd_status = 'warn'
                else:
                    crowd_status = 'normal'

            utilization_ratio = None
            if cap and cap > 0:
                utilization_ratio = float(cumulative) / float(cap)

            out.append({
                **m,
                'window': {
                    'start': start.isoformat(),
                    'end': end.isoformat(),
                },
                'bucket_start': b_iso,
                'in_unique': in_u,
                'out_unique': out_u,
                'net': net,
                'cumulative_net': cumulative,
                'utilization_ratio': utilization_ratio,
                'crowd_status': crowd_status,
            })

        out.sort(key=lambda x: (x.get('bucket_start', ''), x.get('cumulative_net', 0)), reverse=True)
        return Response(out)


class HotelRegistryCsvUploadView(APIView):
    """Upload hotel registry CSV.

    Expected columns (case-insensitive):
    - name
    - district
    - rating (optional)
    - rooms_total (optional)
    - beds_total (optional)
    - lat (optional)
    - lon (optional)
    - category (optional)
    """

    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticatedOrDeviceKey]

    def post(self, request):
        ser = HotelRegistryCsvUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        f = ser.validated_data['file']

        raw = f.read()
        text = raw.decode('utf-8-sig', errors='replace')
        reader = csv.DictReader(io.StringIO(text))

        created = 0
        updated = 0

        for row in reader:
            name = (row.get('name') or row.get('Name') or '').strip()
            district_name = (row.get('district') or row.get('District') or '').strip()
            if not name or not district_name:
                continue

            district, _ = District.objects.get_or_create(name=district_name)
            defaults = {
                'district': district,
                'rating': _to_float(row.get('rating') or row.get('Rating')),
                'rooms_total': _to_int(row.get('rooms_total') or row.get('Rooms') or row.get('rooms')),
                'beds_total': _to_int(row.get('beds_total') or row.get('Beds') or row.get('beds')),
                'lat': _to_float(row.get('lat') or row.get('Latitude')),
                'lon': _to_float(row.get('lon') or row.get('Longitude')),
                'category': (row.get('category') or row.get('Category') or '').strip() or None,
            }

            obj, is_created = Hotel.objects.update_or_create(
                name=name,
                district=district,
                defaults=defaults,
            )
            if is_created:
                created += 1
            else:
                updated += 1

        return Response({'status': 'ok', 'created': created, 'updated': updated})


class InsightsOverviewView(APIView):
    """High-level insights: peaks, under-utilized attractions, and crowded list.

    Query params:
    - district_id (optional)
    - days (optional, default 14)
    - live_minutes (optional, default 60)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        district_id = request.query_params.get('district_id')
        days = int(request.query_params.get('days', '14'))
        live_minutes = int(request.query_params.get('live_minutes', '60'))

        now = datetime.now(tz=timezone.utc)
        start = now - timedelta(days=max(1, min(90, days)))
        live_start = now - timedelta(minutes=max(5, min(720, live_minutes)))

        # 1) Top crowded now (sum of unique visitors across buckets in live window)
        live_qs = FootfallVisit.objects.select_related('source__attraction', 'source__attraction__district').filter(ts__gte=live_start)
        if district_id:
            live_qs = live_qs.filter(source__attraction__district_id=district_id)

        live_rows = live_qs.values(
            'source__attraction_id',
            'source__attraction__name',
            'source__attraction__district__name',
            'source__attraction__capacity_per_5min',
            'source__attraction__crowd_threshold_warn',
            'source__attraction__crowd_threshold_critical',
            'ts',
            'visitor_hash',
        )

        per_bucket: Dict[Tuple[int, str], set] = defaultdict(set)
        attr_meta: Dict[int, Dict[str, Any]] = {}
        for r in live_rows.iterator():
            att_id = r['source__attraction_id']
            attr_meta[att_id] = {
                'attraction_id': att_id,
                'attraction_name': r['source__attraction__name'],
                'district': r['source__attraction__district__name'],
                'capacity_per_5min': r.get('source__attraction__capacity_per_5min'),
                'crowd_threshold_warn': r.get('source__attraction__crowd_threshold_warn'),
                'crowd_threshold_critical': r.get('source__attraction__crowd_threshold_critical'),
            }
            b = _floor_to_5min(r['ts']).isoformat()
            per_bucket[(att_id, b)].add(r['visitor_hash'])

        crowded_totals: Dict[int, int] = defaultdict(int)
        for (att_id, _b), hashes in per_bucket.items():
            crowded_totals[att_id] += len(hashes)

        crowded = []
        for att_id, total in crowded_totals.items():
            m = attr_meta.get(att_id, {'attraction_id': att_id})
            cap = m.get('capacity_per_5min')
            warn = m.get('crowd_threshold_warn')
            critical = m.get('crowd_threshold_critical')

            crowd_status = 'unknown'
            if warn is not None or critical is not None or cap is not None:
                if cap and warn is None:
                    warn = int(float(cap) * 0.75)
                if cap and critical is None:
                    critical = int(float(cap) * 0.9)
                if critical is not None and total >= int(critical):
                    crowd_status = 'critical'
                elif warn is not None and total >= int(warn):
                    crowd_status = 'warn'
                else:
                    crowd_status = 'normal'

            crowded.append({
                **m,
                'live_unique_visitors': total,
                'crowd_status': crowd_status,
            })

        crowded.sort(key=lambda x: x.get('live_unique_visitors', 0), reverse=True)
        crowded = crowded[:10]

        # 2) Peak periods from recent history
        hist_qs = FootfallVisit.objects.select_related('source__attraction', 'source__attraction__district').filter(ts__gte=start, ts__lt=now)
        if district_id:
            hist_qs = hist_qs.filter(source__attraction__district_id=district_id)

        hist_rows = hist_qs.values('source__attraction_id', 'ts', 'visitor_hash')
        hist_bucket: Dict[Tuple[int, str], set] = defaultdict(set)
        for r in hist_rows.iterator():
            b = _floor_to_5min(r['ts']).isoformat()
            hist_bucket[(r['source__attraction_id'], b)].add(r['visitor_hash'])

        bucket_totals: Dict[str, int] = defaultdict(int)
        for (_att_id, b), hashes in hist_bucket.items():
            bucket_totals[b] += len(hashes)

        by_hour: Dict[int, int] = defaultdict(int)
        by_weekday: Dict[int, int] = defaultdict(int)
        for b_iso, total in bucket_totals.items():
            dt = parse_datetime(b_iso)
            if dt is None:
                continue
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            by_hour[dt.hour] += total
            by_weekday[dt.weekday()] += total

        hour_hist = [{'hour': h, 'visitors': by_hour.get(h, 0)} for h in range(24)]
        weekday_hist = [{'weekday': d, 'visitors': by_weekday.get(d, 0)} for d in range(7)]

        # daily totals (useful proxy for "peak season" in short windows)
        by_day: Dict[str, int] = defaultdict(int)
        for b_iso, total in bucket_totals.items():
            dt = parse_datetime(b_iso)
            if dt is None:
                continue
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            by_day[dt.date().isoformat()] += int(total)
        daily_totals = [
            {'date': d, 'visitors': v}
            for d, v in sorted(by_day.items(), key=lambda x: x[0])
        ]
        peak_days = sorted(daily_totals, key=lambda x: x['visitors'], reverse=True)[:10]

        # 3) Under-utilized attractions (avg per bucket vs capacity)
        # reuse hist_bucket to compute totals per attraction across buckets
        att_bucket_counts: Dict[int, int] = defaultdict(int)
        att_bucket_num: Dict[int, int] = defaultdict(int)
        for (att_id, _b), hashes in hist_bucket.items():
            att_bucket_counts[att_id] += len(hashes)
            att_bucket_num[att_id] += 1

        # Pull attraction capacities
        attractions = Attraction.objects.select_related('district').all()
        if district_id:
            attractions = attractions.filter(district_id=district_id)

        under = []
        for a in attractions:
            buckets = att_bucket_num.get(a.id, 0)
            total = att_bucket_counts.get(a.id, 0)
            avg = (float(total) / float(buckets)) if buckets else 0.0
            cap = a.capacity_per_5min
            util = (avg / float(cap)) if cap and cap > 0 else None
            under.append({
                'attraction_id': a.id,
                'attraction_name': a.name,
                'district': a.district.name,
                'capacity_per_5min': cap,
                'avg_unique_per_bucket': avg,
                'utilization_ratio': util,
            })

        # lowest utilization first; unknowns last
        under.sort(key=lambda x: (x['utilization_ratio'] is None, x['utilization_ratio'] if x['utilization_ratio'] is not None else 9e9))
        under = under[:10]

        return Response({
            'window': {
                'start': start.isoformat(),
                'end': now.isoformat(),
                'live_start': live_start.isoformat(),
            },
            'top_crowded': crowded,
            'peak_hours': hour_hist,
            'peak_weekdays': weekday_hist,
            'daily_totals': daily_totals,
            'peak_days': peak_days,
            'under_utilized': under,
        })


class InsightsGapsView(APIView):
    """Demand vs capacity gaps by district.

    Demand proxy: recent attraction footfall (unique visitors per attraction per 5-min bucket summed).
    Capacity proxy: hotel rooms_total sum + occupancy from snapshots.

    Query params:
    - days (optional, default 14)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', '14'))
        now = datetime.now(tz=timezone.utc)
        start = now - timedelta(days=max(1, min(90, days)))

        # Demand: sum bucket-unique per attraction, attributed to district
        ff = FootfallVisit.objects.select_related('source__attraction__district').filter(ts__gte=start, ts__lt=now)
        ff_rows = ff.values('source__attraction_id', 'source__attraction__district_id', 'source__attraction__district__name', 'ts', 'visitor_hash')

        bucketed: Dict[Tuple[int, str], set] = defaultdict(set)
        att_to_district: Dict[int, Tuple[int, str]] = {}
        for r in ff_rows.iterator():
            att_id = r['source__attraction_id']
            att_to_district[att_id] = (r['source__attraction__district_id'], r['source__attraction__district__name'])
            b = _floor_to_5min(r['ts']).isoformat()
            bucketed[(att_id, b)].add(r['visitor_hash'])

        demand_by_district: Dict[int, int] = defaultdict(int)
        district_name: Dict[int, str] = {}
        for (att_id, _b), hashes in bucketed.items():
            did, dname = att_to_district.get(att_id, (None, ''))
            if did is None:
                continue
            district_name[did] = dname
            demand_by_district[did] += len(hashes)

        # Capacity: hotel rooms totals + occupancy averages
        hotels = Hotel.objects.select_related('district').all()
        rooms_by_district: Dict[int, int] = defaultdict(int)
        for h in hotels:
            rooms_by_district[h.district_id] += int(h.rooms_total or 0)
            district_name[h.district_id] = h.district.name

        snaps = HotelAvailabilitySnapshot.objects.select_related('hotel').filter(ts__gte=start, ts__lt=now)
        occ_sum: Dict[int, float] = defaultdict(float)
        occ_cnt: Dict[int, int] = defaultdict(int)
        for s in snaps.iterator():
            did = s.hotel.district_id
            total = s.rooms_total or s.hotel.rooms_total
            avail = s.rooms_available
            if not total or total <= 0 or avail is None:
                continue
            occ = max(0.0, min(1.0, 1.0 - (float(avail) / float(total))))
            occ_sum[did] += occ
            occ_cnt[did] += 1

        out = []
        all_district_ids = set(list(district_name.keys()) + list(demand_by_district.keys()) + list(rooms_by_district.keys()))
        days_f = float((now - start).days or 1)
        for did in sorted(all_district_ids):
            demand = int(demand_by_district.get(did, 0))
            rooms = int(rooms_by_district.get(did, 0))
            occ_avg = (occ_sum[did] / occ_cnt[did]) if occ_cnt[did] else None
            available_rooms_est = None
            if rooms > 0 and occ_avg is not None:
                available_rooms_est = max(0.0, float(rooms) * (1.0 - float(occ_avg)))

            demand_per_day = demand / days_f

            # simple gap heuristic
            cap_index = float(available_rooms_est) if available_rooms_est is not None else float(rooms)
            gap_score = float(demand_per_day) - (cap_index * 0.5)  # scale factor for demo

            recommendation = 'monitor'
            if gap_score > 50 and rooms > 0:
                recommendation = 'increase_capacity_or_redirect'
            elif gap_score > 50 and rooms == 0:
                recommendation = 'add_hotel_inventory_data'
            elif gap_score < -50:
                recommendation = 'boost_marketing_underutilized'

            out.append({
                'district_id': did,
                'district': district_name.get(did, ''),
                'demand_total': demand,
                'demand_per_day': demand_per_day,
                'hotel_rooms_total': rooms,
                'occupancy_avg': occ_avg,
                'available_rooms_est': available_rooms_est,
                'gap_score': gap_score,
                'recommendation': recommendation,
            })

        out.sort(key=lambda x: x['gap_score'], reverse=True)
        return Response({
            'window': {
                'start': start.isoformat(),
                'end': now.isoformat(),
            },
            'districts': out,
        })


class HotelSnapshotCsvUploadView(APIView):
    """Upload hotel availability snapshots CSV.

    Expected columns:
    - hotel_name
    - district
    - ts (ISO datetime)
    - rooms_available
    - rooms_total (optional)
    """

    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticatedOrDeviceKey]

    def post(self, request):
        ser = HotelSnapshotCsvUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        f = ser.validated_data['file']

        raw = f.read()
        text = raw.decode('utf-8-sig', errors='replace')
        reader = csv.DictReader(io.StringIO(text))

        created = 0
        for row in reader:
            hotel_name = (row.get('hotel_name') or row.get('Hotel') or row.get('name') or '').strip()
            district_name = (row.get('district') or row.get('District') or '').strip()
            ts_str = (row.get('ts') or row.get('timestamp') or row.get('time') or '').strip()
            if not hotel_name or not district_name or not ts_str:
                continue

            dt = parse_datetime(ts_str)
            if dt is None:
                continue
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            district, _ = District.objects.get_or_create(name=district_name)
            hotel, _ = Hotel.objects.get_or_create(name=hotel_name, district=district)

            HotelAvailabilitySnapshot.objects.create(
                hotel=hotel,
                ts=dt,
                rooms_available=_to_int(row.get('rooms_available') or row.get('available')),
                rooms_total=_to_int(row.get('rooms_total') or row.get('total')),
                source='csv',
            )
            created += 1

        return Response({'status': 'ok', 'ingested': created})


def _to_int(v: Any) -> int | None:
    try:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            return None
        return int(float(s))
    except Exception:
        return None


def _to_float(v: Any) -> float | None:
    try:
        if v is None:
            return None
        s = str(v).strip()
        if not s:
            return None
        return float(s)
    except Exception:
        return None
