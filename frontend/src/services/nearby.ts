export interface NearbyPlace {
  id: string;
  lat: number;
  lon: number;
  name?: string;
  type?: string; // amenity/shop
  subtype?: string; // cafe, hospital, etc
}

// Query Overpass API (OpenStreetMap) for nearby amenities/shops within radius (meters)
export async function fetchNearbyPlaces(lat: number, lon: number, radius = 800): Promise<NearbyPlace[]> {
  // Common useful amenities/shops
  const amenities = [
    'hospital','clinic','pharmacy','police','fire_station','fuel','atm','bank','cafe','restaurant','fast_food','supermarket','convenience'
  ];
  const query = `
    [out:json][timeout:25];
    (
      ${amenities.map(a => `node["amenity"="${a}"](around:${radius},${lat},${lon});`).join('\n')}
      node["shop"="supermarket"](around:${radius},${lat},${lon});
      node["shop"="convenience"](around:${radius},${lat},${lon});
    );
    out center 50;
  `;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ data: query })
    });
    const json = await res.json();
    const elements = Array.isArray(json?.elements) ? json.elements : [];
    const list: NearbyPlace[] = elements
      .map((el: any): NearbyPlace => ({
        id: String(el.id),
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name,
        type: el.tags?.amenity ? 'amenity' : (el.tags?.shop ? 'shop' : undefined),
        subtype: el.tags?.amenity || el.tags?.shop,
      }))
      .filter((p: NearbyPlace) => typeof p.lat === 'number' && typeof p.lon === 'number');
    return list;
  } catch (e) {
    return [];
  }
}