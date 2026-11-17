# Salah Hub (Django + AlAdhan) — مواقيت الصلاة

Prayer times, Qibla compass, Ramadan calendar, Hijri converter. English + Arabic (RTL), dark/light, mobile-first.

## Run
    python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py runserver
Open http://127.0.0.1:8000

## Features → code
- Prayer times: `core/services.timings` → AlAdhan `/timings` (GPS coordinates) or `/timingsByCity` (manual).
- Automatic location: browser Geolocation API. Manual: country/city dropdowns (countriesnow.space, cached; small offline fallback).
- Qibla: great-circle bearing + distance computed server-side (`services.qibla`); live compass via device sensors.
- Ramadan: `/hijriCalendar` or `/hijriCalendarByCity` for month 9 — Suhoor ends at Fajr, Iftar at Maghrib.
- Hijri converter: `/gToH` and `/hToG`.
- Methods: all AlAdhan methods + Asr school (Standard / Hanafi). "Auto" lets AlAdhan choose by location.

## Notes
- Geolocation and compass sensors need HTTPS (or localhost). To test on a phone use an HTTPS tunnel
  (e.g. ngrok), or on Android: `adb reverse tcp:8000 tcp:8000` then open http://localhost:8000.
- Server needs outbound internet to api.aladhan.com. No database is used.
- Production: set DJANGO_SECRET_KEY, DJANGO_DEBUG=0, DJANGO_ALLOWED_HOSTS; run `collectstatic` and serve with gunicorn + whitenoise/nginx.
