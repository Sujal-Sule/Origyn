import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, Shield, Hexagon, Brain,
  MapPin, CheckCircle, XCircle, AlertTriangle, Copy, Thermometer, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProduct, getProductHistory, recallProduct } from '../../lib/api';
import JourneyMap from '../../components/JourneyMap';

const stageIcons: Record<string, string> = {
  CREATED: '🌱', Created: '🌱',
  DISTRIBUTION: '🚚', Distribution: '🚚',
  RETAIL: '🏪', Retail: '🏪',
  CONSUMER: '👤', Consumer: '👤',
  RECALLED: '⛔', Recalled: '⛔',
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [hasFraud, setHasFraud] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'blockchain' | 'journey' | 'ai'>('info');
  const [recalling, setRecalling] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [prod, hist] = await Promise.all([
          getProduct(id!),
          getProductHistory(id!),
        ]);
        setProduct(prod);
        setHistory(hist.history || []);
        setHasFraud(hist.has_fraud || false);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleRecall = async () => {
    if (!product || !window.confirm('Are you sure you want to recall this product?')) return;
    setRecalling(true);
    try {
      await recallProduct(product.product_id);
      setProduct({ ...product, recalled: true, current_stage: 'RECALLED' });
    } catch (e) {
      console.error(e);
    } finally {
      setRecalling(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-accent-green" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const validGpsCount = history.filter((e) => e.location).length;

  const tabs = [
    { id: 'info' as const, label: 'Product Info', icon: Package },
    { id: 'blockchain' as const, label: 'Blockchain', icon: Hexagon },
    { id: 'journey' as const, label: 'Journey Log', icon: MapPin },
    { id: 'ai' as const, label: 'AI Flags', icon: Brain },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard/products" className="p-2 rounded-lg bg-navy-800/60 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
          <ArrowLeft size={16} className="text-gray-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{product.name}</h1>
            {product.recalled && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-red/20 text-accent-red border border-accent-red/30 animate-pulse">
                RECALLED
              </span>
            )}
            {hasFraud && !product.recalled && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-red/20 text-accent-red border border-accent-red/30">
                🚨 FRAUD DETECTED
              </span>
            )}
            {product.anomaly_flag && !product.recalled && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-amber/20 text-accent-amber border border-accent-amber/30">
                FLAGGED
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{product.product_id} • {product.category}</p>
        </div>
        {!product.recalled && (
          <button
            onClick={handleRecall}
            disabled={recalling}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 transition-colors text-xs font-medium"
          >
            {recalling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Recall Product
          </button>
        )}
      </div>

      {/* ─── MAP — HERO SECTION ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-panel overflow-hidden ${hasFraud ? 'border-accent-red/30' : ''}`}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MapPin size={14} className={hasFraud ? 'text-accent-red' : 'text-accent-green'} />
            Product Journey Map
            {hasFraud && (
              <span className="text-[10px] font-bold text-accent-red bg-accent-red/10 px-2 py-0.5 rounded-full border border-accent-red/20 animate-pulse">
                Fraud Detected
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>{history.length} events</span>
            <span>•</span>
            <span>{validGpsCount} GPS points</span>
          </div>
        </div>
        <div className="p-4">
          <JourneyMap events={history} hasFraud={hasFraud} productId={product.product_id} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800/40 rounded-xl p-1 border border-white/[0.04]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === t.id ? 'bg-navy-600/60 text-white border border-white/[0.08]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5">
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Product Name', value: product.name },
              { label: 'Product ID', value: product.product_id },
              { label: 'Category', value: product.category },
              { label: 'Batch Size', value: product.batch_size || '—' },
              { label: 'Created At', value: product.created_at ? new Date(product.created_at).toLocaleString() : '—' },
              { label: 'Current Stage', value: product.current_stage },
              { label: 'Trust Score', value: `${product.trust_score}/100` },
              { label: 'Status', value: product.recalled ? 'RECALLED' : product.anomaly_flag ? 'FLAGGED' : 'ACTIVE' },
              { label: 'GPS at Creation', value: product.gps || '—' },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-xl bg-navy-950/40 border border-white/[0.04]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{f.label}</p>
                <p className="text-sm font-medium">{String(f.value)}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'blockchain' && (
          <div className="space-y-3">
            {[
              { label: 'Transaction Hash', value: product.blockchain_tx || 'Not recorded' },
              { label: 'IPFS Hash', value: product.ipfs_hash || 'Not uploaded' },
              { label: 'Current DCQR Hash', value: product.current_dcqr_hash || '—' },
              { label: 'Last Updated', value: product.last_updated || '—' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between p-3 rounded-xl bg-navy-950/40 border border-white/[0.04]">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-xs font-mono text-gray-300 truncate">{f.value}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(f.value, f.label)}
                  className="ml-3 p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-white transition-colors flex-shrink-0"
                >
                  {copied === f.label ? <CheckCircle size={12} className="text-accent-green" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
            <div className="mt-2 p-3 rounded-xl bg-accent-green/[0.04] border border-accent-green/10 flex items-center gap-2">
              <Shield size={14} className="text-accent-green" />
              <span className="text-xs text-accent-green font-medium">
                {product.blockchain_tx ? 'Blockchain record confirmed ✓' : 'Not yet on chain'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="space-y-3">
            {history.length === 0 && (
              <p className="text-sm text-gray-600 text-center py-6">No journey events recorded yet</p>
            )}
            {history.map((e, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${e.anomaly_flag ? 'border-accent-red/30 bg-accent-red/[0.03]' : 'border-white/[0.06] bg-navy-950/40'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stageIcons[e.stage] || '📍'}</span>
                    <span className="text-sm font-semibold">{e.stage}</span>
                    {e.anomaly_flag && (
                      <span className="text-[10px] font-bold text-accent-red bg-accent-red/10 px-1.5 py-0.5 rounded">ANOMALY</span>
                    )}
                    {idx === history.length - 1 && (
                      <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-accent-green animate-pulse" /> Current
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">👤 {e.updated_by}</span>
                  {e.gps && <span className="flex items-center gap-1"><MapPin size={10} /> {e.gps}</span>}
                  {e.temperature != null && <span className="flex items-center gap-1"><Thermometer size={10} /> {e.temperature}°C</span>}
                  {e.blockchain_tx && (
                    <span className="flex items-center gap-1 col-span-2 font-mono">
                      <Shield size={10} className="text-accent-green" /> {String(e.blockchain_tx).slice(0, 20)}…
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/[0.06] bg-navy-950/40">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">GPS Fraud Detection</p>
              <div className={`flex items-center gap-2 ${hasFraud ? 'text-accent-red' : 'text-accent-green'}`}>
                {hasFraud ? <XCircle size={16} /> : <CheckCircle size={16} />}
                <span className="text-sm font-semibold">{hasFraud ? '🚨 Impossible movement speed detected' : 'No GPS fraud detected'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-navy-950/40">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Anomaly Flag</p>
              <div className={`flex items-center gap-2 ${product.anomaly_flag ? 'text-accent-red' : 'text-accent-green'}`}>
                {product.anomaly_flag ? <XCircle size={16} /> : <CheckCircle size={16} />}
                <span className="text-sm font-semibold">{product.anomaly_flag ? 'Product flagged for anomaly' : 'No anomalies'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-navy-950/40">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Trust Score</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-navy-600 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${product.trust_score || 0}%`,
                      backgroundColor: (product.trust_score || 0) >= 80 ? '#00FF88' : (product.trust_score || 0) >= 60 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <span className="text-lg font-bold font-mono" style={{ color: (product.trust_score || 0) >= 80 ? '#00FF88' : '#EF4444' }}>
                  {product.trust_score || 0}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-navy-950/40">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Journey Anomaly Summary</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">{history.filter((e) => e.anomaly_flag).length} of {history.length} events flagged</p>
                <p className="text-sm text-gray-400">{validGpsCount} of {history.length} events have GPS coordinates</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
