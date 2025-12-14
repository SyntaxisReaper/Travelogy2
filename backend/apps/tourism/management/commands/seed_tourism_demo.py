from __future__ import annotations

import hashlib
import random
from datetime import datetime, timedelta, timezone

from django.core.management.base import BaseCommand

from apps.tourism.models import (
    Attraction,
    District,
    EntryPoint,
    EntryVisit,
    FootfallSource,
    FootfallVisit,
    Hotel,
    HotelAvailabilitySnapshot,
)


def _floor_to_5min(dt: datetime) -> datetime:
    epoch = int(dt.timestamp())
    floored = epoch - (epoch % 300)
    return datetime.fromtimestamp(floored, tz=timezone.utc)


class Command(BaseCommand):
    help = 'Seed demo data for Tourism Intelligence (Rajasthan)'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=2, help='How many days of demo history to generate')
        parser.add_argument('--wipe', action='store_true', help='Delete existing tourism demo data before seeding')

    def handle(self, *args, **opts):
        days = int(opts['days'])
        wipe = bool(opts['wipe'])

        if wipe:
            self.stdout.write('Wiping existing tourism data...')
            FootfallVisit.objects.all().delete()
            FootfallSource.objects.all().delete()
            EntryVisit.objects.all().delete()
            EntryPoint.objects.all().delete()
            HotelAvailabilitySnapshot.objects.all().delete()
            Hotel.objects.all().delete()
            Attraction.objects.all().delete()
            District.objects.all().delete()

        random.seed(42)

        districts = ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner']
        district_objs = {}
        for d in districts:
            district_objs[d], _ = District.objects.get_or_create(name=d)

        attractions = [
            # Jaipur
            ('Hawa Mahal', 'monument', 'Jaipur', 500),
            ('Amber Fort', 'monument', 'Jaipur', 700),
            ('City Palace', 'museum', 'Jaipur', 450),
            # Jodhpur
            ('Mehrangarh Fort', 'monument', 'Jodhpur', 650),
            ('Jaswant Thada', 'monument', 'Jodhpur', 250),
            # Udaipur
            ('City Palace Udaipur', 'museum', 'Udaipur', 500),
            ('Fateh Sagar Lake Park', 'park', 'Udaipur', 600),
            # Ajmer
            ('Ajmer Sharif Dargah', 'other', 'Ajmer', 800),
            # Bikaner
            ('Junagarh Fort', 'monument', 'Bikaner', 350),
        ]

        attraction_objs = []
        for name, a_type, district_name, cap in attractions:
            att, _ = Attraction.objects.get_or_create(
                name=name,
                district=district_objs[district_name],
                defaults={
                    'attraction_type': a_type,
                    'capacity_per_5min': cap,
                    'crowd_threshold_warn': int(cap * 0.75),
                    'crowd_threshold_critical': int(cap * 0.9),
                },
            )
            attraction_objs.append(att)

        # Create one demo source per attraction
        sources = []
        for att in attraction_objs:
            src, _ = FootfallSource.objects.get_or_create(
                attraction=att,
                name=f'{att.name} - Demo Sensor',
                defaults={'source_type': 'manual', 'meta': {'demo': True}},
            )
            sources.append(src)

        # Entry points (for arrivals into Rajasthan)
        entry_points = [
            ('Jaipur International Airport', 'airport', 'Jaipur'),
            ('Jaipur Junction', 'rail', 'Jaipur'),
            ('Jodhpur Airport', 'airport', 'Jodhpur'),
            ('Udaipur City Railway', 'rail', 'Udaipur'),
            ('Ajmer Bus Stand', 'bus', 'Ajmer'),
        ]

        entry_point_objs = []
        for name, e_type, district_name in entry_points:
            ep, _ = EntryPoint.objects.get_or_create(
                name=name,
                district=district_objs[district_name],
                defaults={'entry_type': e_type},
            )
            entry_point_objs.append(ep)

        # Hotels (registry)
        hotels = [
            ('Heritage Haveli', 'Jaipur', 4.4, 42, 'Heritage'),
            ('Pink City Inn', 'Jaipur', 4.1, 60, 'Hotel'),
            ('Blue City Residency', 'Jodhpur', 4.2, 55, 'Hotel'),
            ('Lakeview Resort', 'Udaipur', 4.7, 80, 'Resort'),
            ('Desert Retreat', 'Bikaner', 4.0, 38, 'Resort'),
        ]

        hotel_objs = []
        for name, district_name, rating, rooms_total, category in hotels:
            h, _ = Hotel.objects.get_or_create(
                name=name,
                district=district_objs[district_name],
                defaults={
                    'rating': rating,
                    'rooms_total': rooms_total,
                    'category': category,
                },
            )
            hotel_objs.append(h)

        # Hotel snapshots: last 2 days, every 6 hours
        now = datetime.now(tz=timezone.utc)
        start = now - timedelta(days=days)
        t = _floor_to_5min(start)
        snap_count = 0
        while t <= now:
            if (t.hour % 6) == 0 and t.minute == 0:
                for h in hotel_objs:
                    total = h.rooms_total or 50
                    # simulate busier on weekends/evenings
                    base_occ = 0.55 + (0.15 if t.weekday() in (4, 5, 6) else 0.0)
                    base_occ += 0.05 if 16 <= t.hour <= 22 else 0.0
                    occ = min(0.95, max(0.2, base_occ + (random.random() - 0.5) * 0.1))
                    available = max(0, int(total * (1 - occ)))
                    HotelAvailabilitySnapshot.objects.create(
                        hotel=h,
                        ts=t,
                        rooms_available=available,
                        rooms_total=total,
                        source='seed',
                    )
                    snap_count += 1
            t += timedelta(minutes=5)

        # Entry visits: last N days, every 5 minutes, hashed arrivals
        entry_count = 0
        t = _floor_to_5min(start)
        while t <= now:
            for ep in entry_point_objs:
                # arrivals are spiky at airports/rail; create a small baseline
                peak = 8 <= t.hour <= 11 or 17 <= t.hour <= 21
                weekend = t.weekday() in (5, 6)
                base = 0.05 if not peak else 0.18
                if weekend:
                    base += 0.03
                base += (random.random() - 0.5) * 0.02

                n_total = max(0, int(200 * min(0.6, max(0.0, base))))
                n_intl = int(n_total * (0.12 + (random.random() * 0.06)))
                n_dom = max(0, n_total - n_intl)

                for i in range(n_dom):
                    token = f"arr_dom|{ep.id}|{t.isoformat()}|{i}"
                    h = hashlib.sha256(token.encode('utf-8')).hexdigest()
                    EntryVisit.objects.create(entry_point=ep, ts=t, visitor_hash=h, visitor_type='domestic')
                for i in range(n_intl):
                    token = f"arr_intl|{ep.id}|{t.isoformat()}|{i}"
                    h = hashlib.sha256(token.encode('utf-8')).hexdigest()
                    EntryVisit.objects.create(entry_point=ep, ts=t, visitor_hash=h, visitor_type='international')
                entry_count += n_total

            t += timedelta(minutes=5)

        # Footfall: last N days, every 5 minutes, hashed unique visitors
        ff_count = 0
        t = _floor_to_5min(start)
        while t <= now:
            for src in sources:
                cap = src.attraction.capacity_per_5min or 300

                # Peak window 10:00-17:00 local-ish; we approximate in UTC for demo
                peak = 10 <= t.hour <= 17
                weekend = t.weekday() in (5, 6)

                base = 0.25 if not peak else 0.55
                if weekend:
                    base += 0.15
                base += (random.random() - 0.5) * 0.1

                n_total = max(0, int(cap * min(0.95, max(0.02, base))))
                n_intl = int(n_total * (0.10 + (random.random() * 0.05)))
                n_dom = max(0, n_total - n_intl)

                # Create hashed visitor tokens unique per bucket
                for i in range(n_dom):
                    token = f"dom|{src.id}|{t.isoformat()}|{i}"
                    h = hashlib.sha256(token.encode('utf-8')).hexdigest()
                    FootfallVisit.objects.create(
                        source=src,
                        ts=t,
                        visitor_hash=h,
                        visitor_type='domestic',
                        direction='in',
                        confidence=0.9,
                    )
                for i in range(n_intl):
                    token = f"intl|{src.id}|{t.isoformat()}|{i}"
                    h = hashlib.sha256(token.encode('utf-8')).hexdigest()
                    FootfallVisit.objects.create(
                        source=src,
                        ts=t,
                        visitor_hash=h,
                        visitor_type='international',
                        direction='in',
                        confidence=0.9,
                    )
                ff_count += n_total

            t += timedelta(minutes=5)

        self.stdout.write(self.style.SUCCESS('Tourism demo seed complete'))
        self.stdout.write(f'Districts: {District.objects.count()}')
        self.stdout.write(f'Entry points: {EntryPoint.objects.count()}')
        self.stdout.write(f'Entry visits created (approx): {entry_count}')
        self.stdout.write(f'Attractions: {Attraction.objects.count()}')
        self.stdout.write(f'Footfall sources: {FootfallSource.objects.count()}')
        self.stdout.write(f'Footfall visits created (approx): {ff_count}')
        self.stdout.write(f'Hotels: {Hotel.objects.count()}')
        self.stdout.write(f'Hotel snapshots created: {snap_count}')
