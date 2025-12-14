from __future__ import annotations

import os

from django.conf import settings
from rest_framework.permissions import BasePermission


class IsAuthenticatedOrDeviceKey(BasePermission):
    """Allow either normal authenticated users or device-key authenticated ingestion.

    If the environment variable `TOURISM_DEVICE_API_KEY` (or Django setting
    `TOURISM_DEVICE_API_KEY`) is set, then requests may authenticate by sending:

        X-Device-Key: <key>

    This is intended for sensors / CV services / ticketing integrations.
    """

    def has_permission(self, request, view) -> bool:
        user = getattr(request, 'user', None)
        if user is not None and getattr(user, 'is_authenticated', False):
            return True

        configured = os.environ.get('TOURISM_DEVICE_API_KEY') or getattr(settings, 'TOURISM_DEVICE_API_KEY', None)
        if not configured:
            return False

        provided = request.headers.get('X-Device-Key') if hasattr(request, 'headers') else None
        if not provided:
            provided = request.META.get('HTTP_X_DEVICE_KEY')

        return bool(provided) and (provided == configured)
