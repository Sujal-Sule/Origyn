import { useEffect, useState } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { getAllProducts } from '../lib/api';
import { Link } from 'react-router-dom';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const stageColors: Record<string, string> = {
  CREATED: '#00FF88',
  IN_TRANSIT: '#3B82F6',
  AT_WAREHOUSE: '#8B5CF6',
  QUALITY_CHECK: '#06B6D4',
  DISPATCHED: '#F59E0B',
  AT_RETAILER: '#A78BFA',
  DELIVERED: '#10B981',
  RECALLED: '#EF4444',
};

interface ProductPin {
  product_id: string;
  name: string;
  current_stage: string;
  lat: number;
  lng: number;
  trust_score: number;
  recalled: boolean;
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

function FallbackMapView({ pins }: { pins: ProductPin[] }) {
  return (
    <div className="h-full flex flex-col bg-navy-800/50 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <AlertTriangle size={16} className="text-accent-amber" />
        <span className="text-sm text-gray-400">Map requires WebGL (enable hardware acceleration in browser settings)</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pins.map((pin) => {
            const color = pin.recalled ? '#EF4444' : stageColors[pin.current_stage] || '#00FF88';
            return (
              <Link
                key={pin.product_id}
                to={`/dashboard/products/${pin.product_id}`}
                className="flex items-center gap-3 bg-navy-900/60 rounded-lg p-3 border border-white/5 hover:border-white/15 transition-colors no-underline"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{pin.name}</p>
                  <p className="text-gray-500 text-xs">{pin.current_stage} • Score: {pin.trust_score}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin size={12} />
                  <span className="text-[10px] font-mono">{pin.lat.toFixed(2)}, {pin.lng.toFixed(2)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OverviewMap() {
  const [pins, setPins] = useState<ProductPin[]>([]);
  const [selected, setSelected] = useState<ProductPin | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    setWebglSupported(checkWebGLSupport());

    getAllProducts().then((products) => {
      const result: ProductPin[] = [];
      for (const p of products) {
        if (!p.gps) continue;
        try {
          const parts = p.gps.split(',').map(Number);
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            result.push({
              product_id: p.product_id,
              name: p.name,
              current_stage: p.current_stage,
              lat: parts[0],
              lng: parts[1],
              trust_score: p.trust_score || 0,
              recalled: p.recalled || false,
            });
          }
        } catch {}
      }
      setPins(result);
    }).catch(console.error);
  }, []);

  if (pins.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600 text-sm flex-col gap-2">
        <MapPin size={24} className="opacity-30" />
        <p>Register products with GPS to see them here</p>
      </div>
    );
  }

  if (!webglSupported || mapError) {
    return <FallbackMapView pins={pins} />;
  }

  // Lazy-load Mapbox only when WebGL is available
  const LazyMap = () => {
    try {
      const MapGL = require('react-map-gl/mapbox');
      const Map = MapGL.default;
      const { Marker, Popup, NavigationControl } = MapGL;
      require('mapbox-gl/dist/mapbox-gl.css');

      return (
        <Map
          initialViewState={{ longitude: 78.9629, latitude: 22, zoom: 3.5 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
          onError={() => setMapError(true)}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {pins.map((pin) => {
            const color = pin.recalled ? '#EF4444' : stageColors[pin.current_stage] || '#00FF88';
            return (
              <Marker
                key={pin.product_id}
                longitude={pin.lng}
                latitude={pin.lat}
                anchor="center"
                onClick={(e: any) => { e.originalEvent.stopPropagation(); setSelected(pin); }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 cursor-pointer hover:scale-150 transition-transform"
                  style={{
                    backgroundColor: `${color}40`,
                    borderColor: color,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </Marker>
            );
          })}

          {selected && (
            <Popup
              longitude={selected.lng}
              latitude={selected.lat}
              anchor="bottom"
              offset={12}
              onClose={() => setSelected(null)}
              closeButton={false}
            >
              <div className="bg-navy-800 text-white rounded-xl p-2.5 min-w-[160px]">
                <p className="text-xs font-bold">{selected.name}</p>
                <p className="text-[10px] text-gray-400">{selected.current_stage}</p>
                <p className="text-[10px] text-gray-400">Trust: {selected.trust_score}</p>
                <Link
                  to={`/dashboard/products/${selected.product_id}`}
                  className="text-[10px] text-accent-green hover:underline mt-1 block"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          )}
        </Map>
      );
    } catch (e) {
      setMapError(true);
      return <FallbackMapView pins={pins} />;
    }
  };

  return <LazyMap />;
}
