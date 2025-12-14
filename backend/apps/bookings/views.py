from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import os, json, uuid

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
RES_FILE = os.path.join(LOG_DIR, 'reservations.jsonl')
os.makedirs(LOG_DIR, exist_ok=True)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hotels_search(request):
    # TODO: integrate provider (e.g., Amadeus)
    return Response([], status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hotels_book(request):
    booking = {
        'id': str(uuid.uuid4()),
        'type': 'hotel',
        'user_id': request.user.id,
        'name': request.data.get('hotel_name') or request.data.get('hotel_id') or 'Hotel',
        'provider': request.data.get('provider', 'backend'),
        'date': timezone.now().isoformat(),
        'data': request.data,
    }
    with open(RES_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(booking, default=str) + '\n')
    return Response(booking, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trains_search(request):
    # TODO: integrate provider
    return Response([], status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trains_book(request):
    booking = {
        'id': str(uuid.uuid4()),
        'type': 'train',
        'user_id': request.user.id,
        'name': request.data.get('train_name') or request.data.get('train_id') or 'Train',
        'provider': request.data.get('provider', 'backend'),
        'date': timezone.now().isoformat(),
        'data': request.data,
    }
    with open(RES_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(booking, default=str) + '\n')
    return Response(booking, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reservations(request):
    results = []
    if os.path.exists(RES_FILE):
        with open(RES_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    rec = json.loads(line)
                    if rec.get('user_id') == request.user.id:
                        results.append(rec)
                except Exception:
                    continue
    return Response(results, status=status.HTTP_200_OK)