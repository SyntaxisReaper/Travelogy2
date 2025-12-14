# Generated manually for this repo to track Tourism Intelligence models.
from __future__ import annotations

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies: list[tuple[str, str]] = []

    operations = [
        migrations.CreateModel(
            name='District',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Attraction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('attraction_type', models.CharField(choices=[('monument', 'Monument'), ('museum', 'Museum'), ('park', 'Park'), ('market', 'Market'), ('other', 'Other')], default='other', max_length=30)),
                ('lat', models.FloatField(blank=True, null=True)),
                ('lon', models.FloatField(blank=True, null=True)),
                ('capacity_per_5min', models.PositiveIntegerField(blank=True, null=True)),
                ('crowd_threshold_warn', models.PositiveIntegerField(blank=True, null=True)),
                ('crowd_threshold_critical', models.PositiveIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('district', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='attractions', to='tourism.district')),
            ],
            options={
                'indexes': [models.Index(fields=['district', 'attraction_type'], name='tourism_att_distric_7c15ed_idx')],
            },
        ),
        migrations.CreateModel(
            name='EntryPoint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('entry_type', models.CharField(choices=[('airport', 'Airport'), ('rail', 'Rail'), ('road', 'Road'), ('bus', 'Bus'), ('other', 'Other')], default='other', max_length=20)),
                ('lat', models.FloatField(blank=True, null=True)),
                ('lon', models.FloatField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('district', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='entry_points', to='tourism.district')),
            ],
        ),
        migrations.CreateModel(
            name='Hotel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('rating', models.FloatField(blank=True, null=True)),
                ('rooms_total', models.PositiveIntegerField(blank=True, null=True)),
                ('beds_total', models.PositiveIntegerField(blank=True, null=True)),
                ('lat', models.FloatField(blank=True, null=True)),
                ('lon', models.FloatField(blank=True, null=True)),
                ('category', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('district', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='hotels', to='tourism.district')),
            ],
            options={
                'indexes': [models.Index(fields=['district'], name='tourism_hotel_distric_1f78bd_idx')],
            },
        ),
        migrations.CreateModel(
            name='FootfallSource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('source_type', models.CharField(choices=[('iot', 'IoT Counter'), ('cv', 'Computer Vision'), ('ticket', 'Ticketing Integration'), ('manual', 'Manual Reporting')], max_length=20)),
                ('meta', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('attraction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sources', to='tourism.attraction')),
            ],
        ),
        migrations.CreateModel(
            name='HotelAvailabilitySnapshot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ts', models.DateTimeField(db_index=True)),
                ('rooms_available', models.PositiveIntegerField(blank=True, null=True)),
                ('rooms_total', models.PositiveIntegerField(blank=True, null=True)),
                ('source', models.CharField(default='csv', max_length=50)),
                ('hotel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='snapshots', to='tourism.hotel')),
            ],
            options={
                'indexes': [models.Index(fields=['hotel', 'ts'], name='tourism_hotelav_hotel_i_5f5a0e_idx')],
            },
        ),
        migrations.CreateModel(
            name='FootfallVisit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ts', models.DateTimeField(db_index=True)),
                ('visitor_hash', models.CharField(db_index=True, max_length=128)),
                ('direction', models.CharField(default='in', max_length=10)),
                ('visitor_type', models.CharField(choices=[('domestic', 'Domestic'), ('international', 'International'), ('unknown', 'Unknown')], default='unknown', max_length=20)),
                ('confidence', models.FloatField(blank=True, null=True)),
                ('source', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='visits', to='tourism.footfallsource')),
            ],
            options={
                'indexes': [
                    models.Index(fields=['source', 'ts'], name='tourism_footfa_source__52b66c_idx'),
                    models.Index(fields=['source', 'visitor_hash'], name='tourism_footfa_source__5555ed_idx'),
                ],
                'constraints': [
                    models.UniqueConstraint(fields=['source', 'ts', 'visitor_hash', 'direction'], name='uniq_footfall_visit'),
                ],
            },
        ),
        migrations.CreateModel(
            name='EntryVisit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ts', models.DateTimeField(db_index=True)),
                ('visitor_hash', models.CharField(db_index=True, max_length=128)),
                ('visitor_type', models.CharField(choices=[('domestic', 'Domestic'), ('international', 'International'), ('unknown', 'Unknown')], default='unknown', max_length=20)),
                ('entry_point', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='visits', to='tourism.entrypoint')),
            ],
            options={
                'indexes': [
                    models.Index(fields=['entry_point', 'ts'], name='tourism_entryv_entry_p_9bf6de_idx'),
                    models.Index(fields=['entry_point', 'visitor_hash'], name='tourism_entryv_entry_p_c8f6aa_idx'),
                ],
                'constraints': [
                    models.UniqueConstraint(fields=['entry_point', 'ts', 'visitor_hash'], name='uniq_entry_visit'),
                ],
            },
        ),
    ]
