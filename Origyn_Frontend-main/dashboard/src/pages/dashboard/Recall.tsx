import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Package, CheckCircle, XCircle, Hexagon, Loader2 } from 'lucide-react';
import { getAllProducts, recallProduct } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function RecallManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalling, setRecalling] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRecall = async (productId: string) => {
    if (!window.confirm(`Recall product ${productId}? This cannot be undone.`)) return;
    setRecalling(productId);
    try {
      await recallProduct(productId);
      setProducts((prev) =>
        prev.map((p) => p.product_id === productId ? { ...p, recalled: true, current_stage: 'RECALLED' } : p)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setRecalling(null);
    }
  };

  const recalled = products.filter((p) => p.recalled);
  const flagged = products.filter((p) => p.anomaly_flag && !p.recalled);
  const safe = products.filter((p) => !p.recalled && !p.anomaly_flag);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recall Management</h1>
        <p className="text-gray-500 text-sm mt-0.5">Enterprise recall system — instant product withdrawal from supply chain</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-5 border-accent-red/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-accent-red/10"><ShieldAlert size={18} className="text-accent-red" /></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Active Recalls</span>
          </div>
          <p className="text-3xl font-bold">{recalled.length}</p>
        </div>
        <div className="glass-panel p-5 border-accent-amber/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-accent-amber/10"><AlertTriangle size={18} className="text-accent-amber" /></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Flagged Products</span>
          </div>
          <p className="text-3xl font-bold">{flagged.length}</p>
        </div>
        <div className="glass-panel p-5 border-accent-green/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-accent-green/10"><CheckCircle size={18} className="text-accent-green" /></div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Safe Products</span>
          </div>
          <p className="text-3xl font-bold">{safe.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent-green" />
        </div>
      ) : (
        <>
          {/* Active Recalls */}
          {recalled.length > 0 && (
            <div className="glass-panel p-5 border-accent-red/20">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                Active Recalls
              </h3>
              <div className="space-y-3">
                {recalled.map((p) => (
                  <div key={p.product_id} className="flex items-center justify-between p-4 rounded-xl bg-accent-red/[0.04] border border-accent-red/10">
                    <div className="flex items-center gap-3">
                      <Package size={16} className="text-accent-red" />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-[11px] text-gray-500">{p.product_id} • Recalled</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-accent-red bg-accent-red/10 px-2 py-0.5 rounded animate-pulse">RECALLED</span>
                      {p.blockchain_tx && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Hexagon size={10} />
                          <span className="font-mono">{String(p.blockchain_tx).slice(0, 10)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flagged — Ready for Recall */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-accent-amber" />
              Flagged Products — Ready for Recall
            </h3>
            <div className="space-y-3">
              {flagged.map((p) => (
                <div key={p.product_id} className="flex items-center justify-between p-4 rounded-xl bg-navy-950/40 border border-white/[0.06] hover:border-accent-amber/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package size={16} className="text-accent-amber" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-[11px] text-gray-500">{p.product_id} • Trust: {p.trust_score} • Stage: {p.current_stage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/products/${p.product_id}`}
                      className="px-3 py-1.5 rounded-lg bg-navy-700/60 text-gray-400 text-xs font-medium border border-white/[0.06] hover:text-white transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleRecall(p.product_id)}
                      disabled={recalling === p.product_id}
                      className="px-4 py-1.5 rounded-lg bg-accent-red text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-60"
                    >
                      {recalling === p.product_id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <ShieldAlert size={12} />
                      )}
                      Initiate Recall
                    </button>
                  </div>
                </div>
              ))}
              {flagged.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No flagged products — all clear ✓</p>
              )}
            </div>
          </div>

          {/* Recall Process */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-semibold mb-4">Recall Process</h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {['Product Flagged', 'Admin Review', 'Recall Initiated', 'Blockchain Updated', 'Mobile Notified', 'Product Withdrawn'].map((step, i) => (
                <div key={step} className="flex items-center gap-3 min-w-fit">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-navy-600/40 text-gray-500 border border-white/[0.06]'}`}>
                      {i + 1}
                    </div>
                    <span className="text-[10px] text-gray-500 text-center max-w-[80px]">{step}</span>
                  </div>
                  {i < 5 && <div className={`w-6 h-[1px] mt-[-14px] ${i < 2 ? 'bg-accent-green/40' : 'bg-navy-600/60'}`} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
