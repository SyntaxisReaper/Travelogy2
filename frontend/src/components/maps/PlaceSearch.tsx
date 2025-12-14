import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface PlaceSuggestion {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

interface PlaceSearchProps {
  onSelect: (place: PlaceSuggestion) => void;
  placeholder?: string;
  autofocus?: boolean;
}

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ onSelect, placeholder = 'Search places…', autofocus }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const debouncedQuery = useDebouncedValue(query, 200);

  const provider = useMemo(() => (MAPBOX_TOKEN ? 'mapbox' : 'nominatim'), []);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    const fetchSuggestions = async () => {
      try {
        if (provider === 'mapbox') {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?autocomplete=true&limit=7&access_token=${MAPBOX_TOKEN}`;
          const res = await fetch(url);
          const json = await res.json();
          if (cancelled) return;
          const items: PlaceSuggestion[] = (json.features || []).map((f: any) => ({
            id: f.id,
            name: f.place_name,
            latitude: f.center?.[1],
            longitude: f.center?.[0],
            city: f.text,
            region: f.context?.find((c: any) => c.id.startsWith('region'))?.text,
            country: f.context?.find((c: any) => c.id.startsWith('country'))?.short_code?.toUpperCase(),
          })).filter((p: any) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
          setSuggestions(items);
          setOpen(true);
          setHighlight(0);
        } else {
          // Nominatim (no key)
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&addressdetails=1&limit=7`;
          const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
          const json = await res.json();
          if (cancelled) return;
          const items: PlaceSuggestion[] = (json || []).map((f: any, idx: number) => ({
            id: f.place_id?.toString?.() || `${idx}-${f.lat}-${f.lon}`,
            name: f.display_name,
            latitude: parseFloat(f.lat),
            longitude: parseFloat(f.lon),
            city: f.address?.city || f.address?.town || f.address?.village || f.address?.hamlet,
            region: f.address?.state || f.address?.region,
            country: f.address?.country_code?.toUpperCase(),
          })).filter((p: any) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
          setSuggestions(items);
          setOpen(true);
          setHighlight(0);
        }
      } catch (e) {
        setSuggestions([]);
        setOpen(false);
      }
    };
    fetchSuggestions();
    return () => { cancelled = true; };
  }, [debouncedQuery, provider]);

  const handleSelect = (s: PlaceSuggestion) => {
    onSelect(s);
    setQuery(`${s.name}`);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        autoFocus={autofocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Search places"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #1de9b6',
          background: '#0c0f14',
          color: '#e6f8ff',
          outline: 'none',
          boxShadow: '0 0 12px rgba(29,233,182,0.2)'
        }}
      />
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            right: 0,
            maxHeight: 260,
            overflowY: 'auto',
            background: '#0c0f14',
            color: '#e6f8ff',
            border: '1px solid #1de9b6',
            borderRadius: 8,
            padding: 4,
            margin: 0,
            listStyle: 'none',
            zIndex: 2000,
            boxShadow: '0 12px 24px rgba(0,0,0,0.5)'
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              onMouseEnter={() => setHighlight(i)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                background: i === highlight ? 'rgba(29,233,182,0.12)' : 'transparent',
                borderRadius: 6
              }}
            >
              <div style={{ fontWeight: 600, color: '#1de9b6' }}>{s.city || s.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{s.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceSearch;