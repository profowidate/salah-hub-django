from functools import wraps
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET
from . import services as sv

def index(request):
    return render(request, "core/index.html", {"methods": sv.METHODS})

def api(fn):
    @require_GET
    @wraps(fn)
    def wrapper(request):
        try:
            return JsonResponse(fn(request.GET), safe=False)
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Upstream service unavailable ({e})"}, status=502)
    return wrapper

@api
def timings(g): return sv.timings(g)

@api
def ramadan(g): return sv.ramadan(g)

@api
def convert(g): return sv.convert(g)

@api
def qibla(g): return sv.qibla(float(g.get("lat", "")), float(g.get("lng", "")))

@api
def countries(g): return sv.countries()

@api
def cities(g):
    if not g.get("country"): raise ValueError("country is required")
    return sv.cities(g["country"])
