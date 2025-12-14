from django.urls import path
from . import views

urlpatterns = [
    path('hotels/search/', views.hotels_search, name='hotels-search'),
    path('hotels/', views.hotels_book, name='hotels-book'),
    path('trains/search/', views.trains_search, name='trains-search'),
    path('trains/', views.trains_book, name='trains-book'),
    path('reservations/', views.reservations, name='reservations'),
]