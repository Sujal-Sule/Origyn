import { useRef, useState } from 'react';
import { MapPin, Thermometer, Shield, AlertTriangle, Clock, Map as MapIcon, Loader2 } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const STAGE_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  CREATED: { emoji: '🌱', color: '#00FF88', label: 'Farm / Created' },
  IN_TRANSIT: { emoji: '🚚', color: '#3B82F6', label: 'In Transit' },
  AT_WAREHOUSE: { emoji: '🏭', color: '#8B5CF6', label: 'Warehouse' },
  QUALITY_CHECK: { emoji: '✅', color: '#06B6D4', label: 'QC Passed' },
  DISPATCHED: { emoji: '📦', color: '#F59E0B', label: 'Dispatched' },
  AT_RETAILER: { emoji: '🏪', color: '#A78BFA', label: 'Retail' },
  DELIVERED: { emoji: '🎉', color: '#10B981', label: 'Delivered' },
  RECALLED: { emoji: '⛔', color: '#EF4444', label: 'Recalled' },
};

function getStageConfig(stage: string) {
  return STAGE_CONFIG[stage] || STAGE_CONFIG[stage?.toUpperCase()] || { emoji: '📍', color: '#06B6D4', label: stage };
}

interface JourneyEvent {
  stage: string;
  location: [number, number] | null;
  updated_by: string;
  timestamp: string;
  temperature?: number | null;
  anomaly_flag?: boolean;
  blockchain_tx?: string;
  gps?: string;
}

interface JourneyMapProps {
  events: JourneyEvent[];
  hasFraud: boolean;
  productId: string;
}

export default function JourneyMap({ events, hasFraud, productId }: JourneyMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<(JourneyEvent & { index: number }) | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);
  const mapRef = useRef<any>(null);

  const validEvents = events.filter((e) => e.location);

  const loadMap = async () => {
    setLoading(true);
    try {
      const MapGL = await import('react-map-gl/mapbox');
      await import('mapbox-gl/dist/mapbox-gl.css');
      setMapComponents(MapGL);
      setMapReady(true);
    } catch (err) {
      console.error("Failed to load journey map:", err);
    } finally {
      setLoading(false);
    }
  };

  if (validEvents.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-gray-600 bg-navy-950/40 rounded-xl border border-white/[0.06]">
        <MapPin size={24} className="mb-2 opacity-30" />
        <p className="text-xs">No GPS location data recorded</p>
      </div>
    );
  }

  if (!mapReady) {
    return (
      <div className="h-[300px] bg-navy-900/50 rounded-xl border border-white/[0.06] flex flex-col items-center justify-center p-6 text-center">
        <MapIcon size={32} className="text-accent-green mb-4 opacity-50" />
        <p className="text-sm text-white font-bold mb-2">Visual Journey Tracker</p>
        <p className="text-xs text-gray-400 mb-6 max-w-[240px]">Interactive mapping is disabled by default to save system resources.</p>
        <button 
          onClick={loadMap}
          disabled={loading}
          className="bg-accent-green/10 text-accent-green border border-accent-green/30 px-6 py-2 rounded-lg text-xs font-bold hover:bg-accent-green hover:text-navy-950 transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <MapIcon size={14} />}
          Initialize Journey Map
        </button>
      </div>
    );
  }

  const { default: Map, Marker, Popup, Source, Layer, NavigationControl } = mapComponents;
  const coordinates = validEvents.map((e) => [e.location![1], e.location![0]]);

  // India Bounding Box: [minLng, minLat, maxLng, maxLat]
  const INDIA_BOUNDS: [number, number, number, number] = [68.1, 6.5, 97.4, 35.5];

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 400 }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: validEvents[validEvents.length - 1].location![1],
          latitude: validEvents[validEvents.length - 1].location![0],
          zoom: 8,
        }}
        maxBounds={INDIA_BOUNDS}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        {coordinates.length >= 2 && (
          <Source id="route" type="geojson" data={{
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates }
          }}>
            <Layer id="route" type="line" paint={{ 'line-color': hasFraud ? '#EF4444' : '#00FF88', 'line-width': 3 }} />
          </Source>
        )}

        {validEvents.map((evt, idx) => (
          <Marker 
            key={idx} 
            longitude={evt.location![1]} 
            latitude={evt.location![0]} 
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedEvent({ ...evt, index: idx }); }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-navy-900/80 border border-white/20 cursor-pointer">
              {getStageConfig(evt.stage).emoji}
            </div>
          </Marker>
        ))}

        {selectedEvent && (
          <Popup
            longitude={selectedEvent.location![1]}
            latitude={selectedEvent.location![0]}
            onClose={() => setSelectedEvent(null)}
            closeButton={false}
          >
            <div className="bg-navy-800 text-white p-2 rounded text-[10px]">
              <p className="font-bold">{getStageConfig(selectedEvent.stage).label}</p>
              <p>{selectedEvent.updated_by}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
