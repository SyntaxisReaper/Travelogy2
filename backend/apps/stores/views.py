from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import os, json, uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
LOG_DIR = os.path.join(BASE_DIR, 'logs')
CATALOG_FILE = os.path.join(DATA_DIR, 'stores.json')
ORDERS_FILE = os.path.join(LOG_DIR, 'orders.jsonl')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# Default catalog if none present
DEFAULT_STORES = [
    { 'id': 's1', 'name': 'City Mart', 'items': [ { 'id': 'i1', 'name': 'Apples (1kg)', 'price': 3.5 }, { 'id': 'i2', 'name': 'Milk (1L)', 'price': 1.2 } ] },
    { 'id': 's2', 'name': 'Green Grocer', 'items': [ { 'id': 'i3', 'name': 'Bananas (1kg)', 'price': 2.8 }, { 'id': 'i4', 'name': 'Bread', 'price': 1.0 } ] },
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stores(request):
    q = request.query_params.get('q', '').lower()
    data = DEFAULT_STORES
    if os.path.exists(CATALOG_FILE):
        try:
            with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception:
            pass
    if q:
        data = [s for s in data if q in s['name'].lower() or any(q in it['name'].lower() for it in s['items'])]
    return Response(data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    payload = request.data
    order = {
        'id': str(uuid.uuid4()),
        'user_id': request.user.id,
        'items': payload.get('items', []),
        'total': sum([float(it.get('price', 0)) * int(it.get('qty', 1)) for it in payload.get('items', [])]),
        'status': 'placed'
    }
    try:
        with open(ORDERS_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(order) + '\n')
    except Exception:
        pass
    return Response({ 'order_id': order['id'] }, status=status.HTTP_201_CREATED)