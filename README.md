# بسم الله الرحمن الرحيم
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

## Screenshots



<img width="1907" height="876" alt="1" src="https://github.com/user-attachments/assets/80bffd19-f26d-4208-ae06-8c8c7e5c6110" />

<img width="1903" height="870" alt="2" src="https://github.com/user-attachments/assets/08538b8b-d097-4c88-a5ab-2587e87c85d6" />

<img width="1908" height="903" alt="66" src="https://github.com/user-attachments/assets/491774f4-b723-45ec-b2d6-7f5e17f96476" />

<img width="1896" height="863" alt="545" src="https://github.com/user-attachments/assets/8489ad4f-3715-46df-b107-5ded3f36ceff" />

<img width="1874" height="875" alt="5454" src="https://github.com/user-attachments/assets/44d7d4da-21da-4278-b4b8-f20cc937ae5f" />

<img width="1900" height="906" alt="Capture" src="https://github.com/user-attachments/assets/959cafcd-aeef-4ab5-9a58-2c5100a68f72" />

<img width="1868" height="917" alt="dfsd" src="https://github.com/user-attachments/assets/4c13b2aa-ab43-401b-bec8-0a53fdf11d54" />

<img width="1797" height="897" alt="sdfsdf" src="https://github.com/user-attachments/assets/700b6f60-4c3d-49af-8b00-ad970f6524e8" />







