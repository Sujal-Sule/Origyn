import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Package, MapPin, AlertTriangle, CheckCircle,
  ChevronRight, Loader2, X, Clock, Map as MapIcon
} from 'lucide-react';
import { getAllProducts, getProductHistory } from '../../lib/api';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const STAGE_CFG: Record<string, { emoji: string; color: string; label: string }> = {
  CREATED:      { emoji: '🌱', color: '#00FF88', label: 'Farm' },
  IN_TRANSIT:   { emoji: '🚚', color: '#3B82F6', label: 'In Transit' },
  AT_WAREHOUSE: { emoji: '🏭', color: '#8B5CF6', label: 'Warehouse' },
  QUALITY_CHECK:{ emoji: '✅', color: '#06B6D4', label: 'QC Passed' },
  DISPATCHED:   { emoji: '📦', color: '#F59E0B', label: 'Dispatched' },
  AT_RETAILER:  { emoji: '🏪', color: '#A78BFA', label: 'Retail' },
  DELIVERED:    { emoji: '🎉', color: '#10B981', label: 'Delivered' },
  RECALLED:     { emoji: '⛔', color: '#EF4444', label: 'Recalled' },
};

const cfg = (s: string) => STAGE_CFG[s] || STAGE_CFG[s?.toUpperCase()] || { emoji: '📍', color: '#06B6D4', label: s };

function parseGps(gps: any): [number, number] | null {
  if (!gps) return null;
  try {
    if (Array.isArray(gps) && gps.length >= 2) {
      const lat = parseFloat(gps[0]);
      const lng = parseFloat(gps[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (typeof gps === 'string') {
      const p = gps.split(',').map((x) => parseFloat(x.trim()));
      if (p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1])) return [p[0], p[1]];
    }
  } catch {}
  return null;
}

function checkWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('webgl2') || c.getContext('experimental-webgl'));
  } catch { return false; }
}

export default function MapView() {
  const mapRef = useRef<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [journey, setJourney] = useState<any[]>([]);
  const [hasFraud, setHasFraud] = useState(false);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [popup, setPopup] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);
  const [webglOk] = useState(() => checkWebGL());

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectProduct = async (p: any) => {
    setSelected(p);
    setJourney([]);
    setJourneyLoading(true);
    try {
      const hist = await getProductHistory(p.product_id);
      const validEvents = (hist.history || []).filter((e: any) => e.location);
      setJourney(validEvents);
      setHasFraud(hist.has_fraud || false);
      
      if (mapReady && validEvents.length > 0 && mapRef.current) {
        const map = mapRef.current.getMap();
        map.flyTo({ center: [validEvents[0].location[1], validEvents[0].location[0]], zoom: 10 });
      }
    } catch (e) { console.error(e); }
    finally { setJourneyLoading(false); }
  };

  const loadMap = async () => {
    if (mapReady) return;
    setJourneyLoading(true);
    try {
      const MapGL = await import('react-map-gl/mapbox');
      await import('mapbox-gl/dist/mapbox-gl.css');
      setMapComponents(MapGL);
      setMapReady(true);
    } catch (err) {
      console.error("Failed to load map:", err);
    } finally {
      setJourneyLoading(false);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.product_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)', margin: '-1rem -1.5rem' }}>
      <aside className="w-72 flex-shrink-0 bg-navy-800/70 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-10">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-3 text-white">
            <MapIcon size={14} className="text-accent-green" />
            Supply Chain Tracker
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-navy-900/60 border border-white/[0.06] rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-accent-green/40 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-accent-green" /></div>}
          {filtered.map((p) => {
            const isSelected = selected?.product_id === p.product_id;
            return (
              <button
                key={p.product_id}
                onClick={() => selectProduct(p)}
                className={`w-full text-left px-4 py-3 border-b border-white/[0.04] transition-all ${isSelected ? 'bg-accent-green/[0.06] border-l-2 border-l-accent-green' : 'hover:bg-white/[0.02]'}`}
              >
                <p className="text-xs font-semibold truncate text-white">{p.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">#{p.product_id.split('-').pop()}</p>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-white/[0.06] bg-navy-900/40 p-4 overflow-hidden">
               <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Clock size={12} className="text-accent-green" />
                    Journey Route
                  </h3>
                  <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {journey.map((e, idx) => (
                    <div key={idx} className="flex gap-3 text-[11px]">
                      <span className="text-base">{cfg(e.stage).emoji}</span>
                      <div>
                        <p className="text-white font-medium">{cfg(e.stage).label}</p>
                        <p className="text-gray-500">{new Date(e.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      <div className="flex-1 relative bg-[#050810] flex items-center justify-center">
        {!mapReady ? (
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapIcon size={32} className="text-accent-green" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Resource-Friendly Map</h2>
            <p className="text-gray-400 text-sm mb-8">
              Click below to initialize the supply chain map. We load it on demand to prevent your system from slowing down.
            </p>
            {!webglOk && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 mb-6 flex items-center gap-3 text-left">
                <AlertTriangle size={18} className="text-accent-red shrink-0" />
                <p className="text-xs text-accent-red">WebGL not detected. Please enable Hardware Acceleration.</p>
              </div>
            )}
            <button
              onClick={loadMap}
              disabled={journeyLoading || !webglOk}
              className="bg-accent-green text-navy-950 px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {journeyLoading ? <Loader2 size={18} className="animate-spin" /> : <MapIcon size={18} />}
              Load Map Interface
            </button>
          </div>
        ) : (
          (() => {
            const { default: Map, Marker, Popup, Source, Layer, NavigationControl } = mapComponents;
            const routeGeo = journey.length >= 2 ? {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'LineString' as const,
                coordinates: journey.map((e) => [e.location[1], e.location[0]]),
              },
            } : null;

            // India Bounding Box: [minLng, minLat, maxLng, maxLat]
            const INDIA_BOUNDS: [number, number, number, number] = [68.1, 6.5, 97.4, 35.5];

            return (
              <Map
                ref={mapRef}
                initialViewState={{ longitude: 78.9629, latitude: 22.5, zoom: 4.5 }}
                maxBounds={INDIA_BOUNDS}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={TOKEN}
                attributionControl={false}
                onClick={() => setPopup(null)}
              >
                <NavigationControl position="bottom-right" showCompass />
                {routeGeo && (
                  <Source id="route" type="geojson" data={routeGeo}>
                    <Layer id="route-line" type="line" paint={{ 'line-color': hasFraud ? '#EF4444' : '#00FF88', 'line-width': 4 }} />
                  </Source>
                )}
                {journey.map((e, idx) => (
                  <Marker key={`j-${idx}`} longitude={e.location[1]} latitude={e.location[0]} anchor="center">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-navy-900/80 border border-white/20">
                      {cfg(e.stage).emoji}
                    </div>
                  </Marker>
                ))}
                {!selected && products.filter(p => p.gps).map(p => {
                  const coords = parseGps(p.gps);
                  if (!coords) return null;
                  return (
                    <Marker key={p.product_id} longitude={coords[1]} latitude={coords[0]} anchor="center"
                      onClick={(ev: any) => { ev.originalEvent.stopPropagation(); setPopup({ type: 'product', product: p, coords }); }}>
                      <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer" style={{ backgroundColor: cfg(p.current_stage).color }} />
                    </Marker>
                  );
                })}
              </Map>
            );
          })()
        )}
      </div>
    </div>
  );
}
