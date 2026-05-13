import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight, Shield, MapPin, Loader2 } from 'lucide-react';
import { getAllProducts } from '../../lib/api';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  verified: { label: 'Verified', color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
  in_transit: { label: 'In Transit', color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/20' },
  recalled: { label: 'Recalled', color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/20' },
  flagged: { label: 'Flagged', color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/20' },
  CREATED: { label: 'Created', color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/20' },
  DISTRIBUTION: { label: 'In Transit', color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/20' },
  RETAIL: { label: 'Retail', color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
  RECALLED: { label: 'Recalled', color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/20' },
};

function getStatusConfig(product: any) {
  if (product.recalled) return statusConfig['RECALLED'];
  if (product.anomaly_flag) return statusConfig['flagged'];
  return statusConfig[product.current_stage] || statusConfig['CREATED'];
}

export default function Products() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stages = ['all', 'CREATED', 'DISTRIBUTION', 'RETAIL', 'RECALLED'];

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.product_id?.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || p.current_stage === stageFilter ||
      (stageFilter === 'RECALLED' && p.recalled);
    return matchSearch && matchStage;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} products tracked across the network</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or product ID..."
              className="w-full bg-navy-950/60 border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-accent-green/40 transition-colors placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${stageFilter === s ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-navy-800/60 text-gray-500 border border-white/[0.06] hover:text-white'}`}
              >
                {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-accent-green" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Product</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Stage</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Trust</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Blockchain TX</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-600 text-sm">
                      No products found
                    </td>
                  </tr>
                )}
                {filtered.map((p, i) => {
                  const st = getStatusConfig(p);
                  return (
                    <motion.tr
                      key={p.product_id || p._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.recalled ? 'bg-accent-red/10 border border-accent-red/20' : 'bg-accent-green/[0.06] border border-accent-green/10'}`}>
                            <Package size={16} className={p.recalled ? 'text-accent-red' : 'text-accent-green'} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{p.name}</p>
                            <p className="text-[11px] text-gray-500">{p.product_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-400">{p.current_stage}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-1.5 rounded-full bg-navy-600 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${p.trust_score || 0}%`,
                                backgroundColor: (p.trust_score || 0) >= 80 ? '#00FF88' : (p.trust_score || 0) >= 60 ? '#F59E0B' : '#EF4444'
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono font-medium" style={{ color: (p.trust_score || 0) >= 80 ? '#00FF88' : (p.trust_score || 0) >= 60 ? '#F59E0B' : '#EF4444' }}>
                            {p.trust_score || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${st.bg} ${st.color} ${st.border} border`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.blockchain_tx ? (
                          <div className="flex items-center gap-1.5">
                            <Shield size={12} className="text-accent-green" />
                            <span className="text-[11px] font-mono text-gray-400">
                              {String(p.blockchain_tx).slice(0, 8)}...
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/dashboard/products/${p.product_id}`} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-accent-green text-xs font-medium">
                          Details <ChevronRight size={14} />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
