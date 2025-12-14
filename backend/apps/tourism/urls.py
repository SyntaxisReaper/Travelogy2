from django.urls import path

from . import views

urlpatterns = [
    path('meta/', views.MetaView.as_view(), name='tourism-meta'),

    path('districts/', views.DistrictListView.as_view(), name='tourism-districts'),

    path('attractions/', views.AttractionListCreateView.as_view(), name='tourism-attractions'),
    path('attractions/<int:pk>/', views.AttractionDetailView.as_view(), name='tourism-attraction-detail'),

    path('sources/', views.FootfallSourceListCreateView.as_view(), name='tourism-sources'),
    path('sources/<int:pk>/', views.FootfallSourceDetailView.as_view(), name='tourism-source-detail'),

    path('entry_points/', views.EntryPointListCreateView.as_view(), name='tourism-entry-points'),
    path('entry_points/<int:pk>/', views.EntryPointDetailView.as_view(), name='tourism-entry-point-detail'),

    path('hotels/', views.HotelListCreateView.as_view(), name='tourism-hotels'),
    path('hotels/snapshots/', views.HotelSnapshotsView.as_view(), name='tourism-hotel-snapshots'),
    path('hotels/utilization/', views.HotelUtilizationView.as_view(), name='tourism-hotel-utilization'),

    path('ingest/footfall/', views.IngestFootfallView.as_view(), name='tourism-ingest-footfall'),
    path('footfall/live/', views.FootfallLiveView.as_view(), name='tourism-footfall-live'),
    path('footfall/presence/', views.FootfallPresenceView.as_view(), name='tourism-footfall-presence'),
    path('footfall/timeseries/', views.FootfallTimeseriesView.as_view(), name='tourism-footfall-timeseries'),

    path('ingest/entry/', views.IngestEntryView.as_view(), name='tourism-ingest-entry'),
    path('entry/live/', views.EntryLiveView.as_view(), name='tourism-entry-live'),
    path('entry/timeseries/', views.EntryTimeseriesView.as_view(), name='tourism-entry-timeseries'),

    path('ingest/hotels/registry_csv/', views.HotelRegistryCsvUploadView.as_view(), name='tourism-hotels-registry-csv'),
    path('ingest/hotels/snapshot_csv/', views.HotelSnapshotCsvUploadView.as_view(), name='tourism-hotels-snapshot-csv'),

    path('insights/overview/', views.InsightsOverviewView.as_view(), name='tourism-insights-overview'),
    path('insights/gaps/', views.InsightsGapsView.as_view(), name='tourism-insights-gaps'),
]
