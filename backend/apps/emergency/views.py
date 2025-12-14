from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import os, json

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
REPORTS_FILE = os.path.join(LOG_DIR, 'emergency_reports.jsonl')

os.makedirs(LOG_DIR, exist_ok=True)

@api_view(['POST'])
@permission_classes([AllowAny])
def report(request):
    """Accept emergency report and persist to a log file (JSONL)."""
    payload = request.data
    record = {
        'timestamp': timezone.now().isoformat(),
        'user': getattr(request.user, 'id', None) if request.user and request.user.is_authenticated else None,
        'data': payload,
    }
    try:
        with open(REPORTS_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(record, default=str) + '\n')
    except Exception:
        pass
    return Response({'ok': True}, status=status.HTTP_201_CREATED)