import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = ["django.contrib.staticfiles", "core"]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [], "APP_DIRS": True,
    "OPTIONS": {"context_processors": ["django.template.context_processors.request"]},
}]
WSGI_APPLICATION = "config.wsgi.application"
DATABASES = {}  # No database needed: all data comes from AlAdhan (cached in memory)
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
