from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/timings/", views.timings),
    path("api/qibla/", views.qibla),
    path("api/ramadan/", views.ramadan),
    path("api/convert/", views.convert),
    path("api/countries/", views.countries),
    path("api/cities/", views.cities),
]
