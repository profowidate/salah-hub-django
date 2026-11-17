"""AlAdhan + country/city helpers. Responses are cached to stay fast and polite."""
import datetime, hashlib, json, math, re, urllib.request
from urllib.parse import urlencode
from django.core.cache import cache

ALADHAN = "https://api.aladhan.com/v1"
COUNTRIES_API = "https://countriesnow.space/api/v0.1/countries"
KAABA = (21.422487, 39.826206)

METHODS = [
    {"id": 0, "en": "Shia Ithna-Ashari (Jafari)"}, {"id": 1, "en": "Univ. of Islamic Sciences, Karachi", "ar": "جامعة العلوم الإسلامية، كراتشي"},
    {"id": 2, "en": "ISNA (North America)", "ar": "أمريكا الشمالية (ISNA)"}, {"id": 3, "en": "Muslim World League", "ar": "رابطة العالم الإسلامي"},
    {"id": 4, "en": "Umm Al-Qura, Makkah", "ar": "أم القرى، مكة المكرمة"}, {"id": 5, "en": "Egyptian General Authority of Survey", "ar": "الهيئة المصرية العامة للمساحة"},
    {"id": 7, "en": "Institute of Geophysics, Tehran"}, {"id": 8, "en": "Gulf Region", "ar": "منطقة الخليج"},
    {"id": 9, "en": "Kuwait", "ar": "الكويت"}, {"id": 10, "en": "Qatar", "ar": "قطر"},
    {"id": 11, "en": "Singapore (MUIS)"}, {"id": 12, "en": "France (UOIF)"},
    {"id": 13, "en": "Diyanet, Türkiye", "ar": "رئاسة الشؤون الدينية، تركيا"}, {"id": 14, "en": "Russia (Spiritual Administration)"},
    {"id": 15, "en": "Moonsighting Committee"}, {"id": 16, "en": "Dubai", "ar": "دبي"},
    {"id": 17, "en": "Malaysia (JAKIM)"}, {"id": 18, "en": "Tunisia", "ar": "تونس"},
    {"id": 19, "en": "Algeria", "ar": "الجزائر"}, {"id": 20, "en": "Indonesia (KEMENAG)"},
    {"id": 21, "en": "Morocco", "ar": "المغرب"}, {"id": 22, "en": "Portugal (Lisbon)"},
    {"id": 23, "en": "Jordan", "ar": "الأردن"},
]
FALLBACK_CITIES = {
    "Egypt": ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Mansoura", "Tanta"],
    "Saudi Arabia": ["Makkah", "Madinah", "Riyadh", "Jeddah", "Dammam"],
    "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
    "United Kingdom": ["London", "Birmingham", "Manchester"],
    "United States": ["New York", "Chicago", "Houston", "Los Angeles"],
    "Turkey": ["Istanbul", "Ankara", "Izmir"],
}

def fetch(url, body=None, ttl=3600):
    key = hashlib.md5((url + json.dumps(body or {}, sort_keys=True)).encode()).hexdigest()
    hit = cache.get(key)
    if hit is not None:
        return hit
    req = urllib.request.Request(
        url, data=json.dumps(body).encode() if body else None,
        headers={"Content-Type": "application/json", "User-Agent": "SalahHub/1.0"})
    with urllib.request.urlopen(req, timeout=12) as r:
        out = json.load(r)
    cache.set(key, out, ttl)
    return out

def loc(g):
    if g.get("lat") and g.get("lng"):
        float(g["lat"]); float(g["lng"])  # ValueError -> HTTP 400
        return "coords", {"latitude": g["lat"], "longitude": g["lng"]}
    if g.get("city") and g.get("country"):
        return "city", {"city": g["city"], "country": g["country"]}
    raise ValueError("Provide lat & lng, or city & country")

def opts(g):
    o = {"school": "1" if g.get("school") == "1" else "0"}
    if str(g.get("method", "")).isdigit():
        o["method"] = g["method"]
    return o

def check_date(s):
    if not re.fullmatch(r"\d{1,2}-\d{1,2}-\d{4}", s or ""):
        raise ValueError("Date must be DD-MM-YYYY")
    return s

def timings(g):
    kind, p = loc(g)
    date = g.get("date") or datetime.date.today().strftime("%d-%m-%Y")
    check_date(date)
    ep = "timings" if kind == "coords" else "timingsByCity"
    return fetch(f"{ALADHAN}/{ep}/{date}?{urlencode({**p, **opts(g)})}", ttl=1800)["data"]

def ramadan(g):
    kind, p = loc(g)
    year = g.get("year")
    if not year:
        h = fetch(f"{ALADHAN}/gToH/{datetime.date.today():%d-%m-%Y}", ttl=3600)["data"]["hijri"]
        year = int(h["year"]) + (1 if int(h["month"]["number"]) > 9 else 0)
    year = int(year)
    ep = "hijriCalendar" if kind == "coords" else "hijriCalendarByCity"
    days = fetch(f"{ALADHAN}/{ep}/{year}/9?{urlencode({**p, **opts(g)})}", ttl=43200)["data"]
    return {"year": year, "days": [{
        "hijri": d["date"]["hijri"]["day"], "greg": d["date"]["gregorian"]["date"],
        "fajr": d["timings"]["Fajr"], "maghrib": d["timings"]["Maghrib"]} for d in days]}

def convert(g):
    ep = {"g2h": "gToH", "h2g": "hToG"}.get(g.get("type"))
    if not ep:
        raise ValueError("type must be g2h or h2g")
    return fetch(f"{ALADHAN}/{ep}/{check_date(g.get('date'))}", ttl=86400)["data"]

def qibla(lat, lng):
    """Initial great-circle bearing to the Kaaba (degrees from true north) + distance (km)."""
    p1, p2, dl = math.radians(lat), math.radians(KAABA[0]), math.radians(KAABA[1] - lng)
    y = math.sin(dl) * math.cos(p2)
    x = math.cos(p1) * math.sin(p2) - math.sin(p1) * math.cos(p2) * math.cos(dl)
    bearing = (math.degrees(math.atan2(y, x)) + 360) % 360
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return {"bearing": round(bearing, 2), "distance_km": round(6371 * 2 * math.asin(math.sqrt(a)))}

def countries():
    try:
        d = fetch(f"{COUNTRIES_API}/positions", ttl=604800)["data"]
        return sorted({c["name"] for c in d})
    except Exception:
        return sorted(FALLBACK_CITIES)

def cities(country):
    try:
        d = fetch(f"{COUNTRIES_API}/cities", body={"country": country}, ttl=604800)["data"]
        if d:
            return sorted(set(d))
    except Exception:
        pass
    return FALLBACK_CITIES.get(country, [])
