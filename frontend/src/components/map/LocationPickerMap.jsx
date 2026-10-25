import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/axios';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle,
  Loader2,
  Compass,
  X,
  MapPinCheck,
  AlertCircle
} from 'lucide-react';

// Fix Leaflet default marker icon issue in React bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to dynamically re-center/pan map when coordinates update
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [center, map]);
  return null;
}

function MapEventsHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const POPULAR_CITIES = [
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
];

export default function LocationPickerMap({
  latitude = 12.9716,
  longitude = 77.5946,
  onLocationChange,
  height = '320px',
  initialSearchQuery = '',
}) {
  const [position, setPosition] = useState([latitude, longitude]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Pin placed on map. Drag pin or use GPS.');
  const [showDropdown, setShowDropdown] = useState(false);
  const [accuracyNotice, setAccuracyNotice] = useState('');

  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Reverse geocoding using backend proxy with zero 403 blocks, plus client fallback
  const fetchAddressForCoordinates = async (lat, lng, streetHint = '') => {
    // 1. Query Spring Boot backend proxy (which sends official User-Agent to OpenStreetMap)
    try {
      const res = await api.get('/geocode/reverse', {
        params: { lat, lng },
      });
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        return {
          street: streetHint || d.street,
          city: d.city || 'Bangalore',
          state: d.state || 'Karnataka',
          postalCode: d.postalCode || '560001',
          displayName: d.formattedAddress || `${d.street}, ${d.city} - ${d.postalCode}`,
        };
      }
    } catch (err) {
      console.warn('Backend reverse geocode failed, trying client fallback...', err);
    }

    // 2. Direct client fallback via BigDataCloud reverse geocode client API
    try {
      const bdRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (bdRes.ok) {
        const bd = await bdRes.json();
        const city = bd.city || bd.locality || 'Bangalore';
        const state = bd.principalSubdivision || 'Karnataka';
        const postalCode = bd.postcode || '560001';
        const locality = bd.locality || bd.city || '';
        const street = streetHint || (locality ? `${locality} Area` : 'Main Road');
        const displayName = [street, city, state, postalCode].filter(Boolean).join(', ');

        return { street, city, state, postalCode, displayName };
      }
    } catch (bdErr) {
      console.warn('BigDataCloud fallback failed:', bdErr);
    }

    // Default fallback
    return {
      street: streetHint || 'Selected Location Area',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      displayName: streetHint ? `${streetHint}, Bangalore - 560001` : `${lat}, ${lng}`,
    };
  };

  const handleSelect = async (lat, lng, streetHint = '', explicitSearchText = '') => {
    const fixedLat = Number(Number(lat).toFixed(6));
    const fixedLng = Number(Number(lng).toFixed(6));
    setPosition([fixedLat, fixedLng]);
    setLoadingAddress(true);
    setStatusMessage(`Resolving address for ${fixedLat}, ${fixedLng}...`);

    try {
      const geo = await fetchAddressForCoordinates(fixedLat, fixedLng, streetHint);

      // Populate search bar with readable address name
      const barText = explicitSearchText || geo.displayName || `${geo.street}, ${geo.city}`;
      setSearchQuery(barText);
      setStatusMessage(`${geo.street}, ${geo.city} - ${geo.postalCode}`);

      if (onLocationChange) {
        onLocationChange({
          latitude: fixedLat,
          longitude: fixedLng,
          street: geo.street,
          city: geo.city,
          state: geo.state,
          postalCode: geo.postalCode,
          formattedAddress: barText,
        });
      }
    } catch (e) {
      console.error('Error handling location select:', e);
    } finally {
      setLoadingAddress(false);
      setShowDropdown(false);
    }
  };

  // Autocomplete live search as user types (powered by Backend Geocoding Proxy)
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await api.get('/geocode/search', {
          params: { q: query.trim() },
        });

        if (res.data?.success && res.data?.data) {
          setSuggestions(res.data.data);
          setShowDropdown(res.data.data.length > 0);
        }
      } catch (err) {
        console.warn('Autocomplete fetch failed:', err);
      } finally {
        setSearching(false);
      }
    }, 280);
  };

  const handleSelectSuggestion = (s) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lng || s.lon);
    handleSelect(lat, lon, s.street, s.displayName);
    setShowDropdown(false);
  };

  // High-accuracy "Use My Location" GPS functionality
  const handleLocateMe = () => {
    setLocating(true);
    setAccuracyNotice('');
    setStatusMessage('Acquiring high-accuracy GPS coordinates...');
    setShowDropdown(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          const acc = Math.round(pos.coords.accuracy);
          if (acc > 300) {
            setAccuracyNotice(`Desktop location approximate (±${acc}m). You can search your building or drag the pin.`);
          } else {
            setAccuracyNotice(`GPS Accuracy: high (±${acc}m)`);
          }
          handleSelect(pos.coords.latitude, pos.coords.longitude);
        },
        async (err) => {
          console.warn('Browser GPS unavailable or permission prompt dismissed, checking IP location...', err);
          setAccuracyNotice('GPS permission unavailable. Falling back to IP network location.');
          try {
            const ipRes = await fetch('https://ipwho.is/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData && ipData.latitude && ipData.longitude) {
                const hint = [ipData.city, ipData.region].filter(Boolean).join(', ');
                handleSelect(ipData.latitude, ipData.longitude, hint);
                setLocating(false);
                return;
              }
            }
          } catch (ipErr) {
            console.warn('IP geolocation fallback failed', ipErr);
          }
          // Default fallback
          setLocating(false);
          handleSelect(12.9716, 77.5946, 'Bangalore Central');
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setLocating(false);
      handleSelect(12.9716, 77.5946, 'Bangalore Central');
    }
  };

  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }

    setSearching(true);
    setStatusMessage(`Searching for "${searchQuery}"...`);

    try {
      const res = await api.get('/geocode/search', {
        params: { q: searchQuery.trim() },
      });
      if (res.data?.success && res.data?.data && res.data.data.length > 0) {
        handleSelectSuggestion(res.data.data[0]);
      } else {
        setStatusMessage(`No results found for "${searchQuery}". Please drag the pin on map.`);
      }
    } catch (err) {
      console.warn('Search geocoding failed', err);
    } finally {
      setSearching(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="space-y-3 relative">
      {/* Search Bar & Locate Controls */}
      <div className="flex flex-col sm:flex-row gap-2 relative">
        <div className="relative flex-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-indigo-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              placeholder="Type area, colony, apartment (e.g. Indiranagar, Koramangala, Powai)..."
              className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="absolute right-14 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={searching}
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {searching ? 'Finding...' : 'Search'}
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-[2000] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(s)}
                  className="p-2.5 text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer flex items-start gap-2 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-900 dark:text-white">{s.street || s.displayName.split(',')[0]}</span>
                    <span className="text-slate-500 text-[11px] block truncate">{s.displayName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prominent Use My Location Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-60 flex-shrink-0"
        >
          {locating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 fill-white" />
          )}
          <span>{locating ? 'Detecting Location...' : 'Use My Location'}</span>
        </button>
      </div>

      {/* Accuracy Feedback Pill */}
      {accuracyNotice && (
        <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{accuracyNotice}</span>
        </div>
      )}

      {/* Quick City Jump Shortcuts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-indigo-600" />
          <span>Popular:</span>
        </span>
        {POPULAR_CITIES.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => handleSelect(c.lat, c.lng, c.name, `${c.name}, City Center`)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap transition-colors"
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Map Viewport Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
        <div style={{ height }}>
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeView center={position} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={position}
              icon={defaultIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const latlng = marker.getLatLng();
                  handleSelect(latlng.lat, latlng.lng);
                },
              }}
            />
            <MapEventsHandler onLocationSelect={handleSelect} />
          </MapContainer>
        </div>

        {/* Dynamic Status / Coordinates Pill */}
        <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 shadow-lg">
          <div className="flex items-center gap-2 truncate pr-2">
            {loadingAddress ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
            ) : (
              <MapPinCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
              {statusMessage}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
            {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}
