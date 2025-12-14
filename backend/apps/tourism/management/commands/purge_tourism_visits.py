from __future__ import annotations

from datetime import datetime, timedelta, timezone

from django.core.management.base import BaseCommand

from apps.tourism.models import EntryVisit, FootfallVisit


class Command(BaseCommand):
    help = 'Purge old Tourism Intelligence visit events (FootfallVisit, EntryVisit)'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=30, help='Delete visit events older than N days (default: 30)')
        parser.add_argument('--dry-run', action='store_true', help='Show counts but do not delete')

    def handle(self, *args, **opts):
        days = int(opts['days'])
        dry = bool(opts['dry_run'])

        cutoff = datetime.now(tz=timezone.utc) - timedelta(days=max(1, days))

        footfall_qs = FootfallVisit.objects.filter(ts__lt=cutoff)
        entry_qs = EntryVisit.objects.filter(ts__lt=cutoff)

        footfall_count = footfall_qs.count()
        entry_count = entry_qs.count()

        self.stdout.write(f'Cutoff: {cutoff.isoformat()}')
        self.stdout.write(f'FootfallVisit to delete: {footfall_count}')
        self.stdout.write(f'EntryVisit to delete: {entry_count}')

        if dry:
            self.stdout.write(self.style.WARNING('Dry-run enabled; nothing deleted.'))
            return

        deleted_ff = footfall_qs.delete()[0]
        deleted_entry = entry_qs.delete()[0]

        self.stdout.write(self.style.SUCCESS('Purge complete'))
        self.stdout.write(f'FootfallVisit deleted: {deleted_ff}')
        self.stdout.write(f'EntryVisit deleted: {deleted_entry}')
