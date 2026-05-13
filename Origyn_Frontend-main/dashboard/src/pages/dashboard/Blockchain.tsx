import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Database, CheckCircle, XCircle, Loader, Fuel, Copy, Shield } from 'lucide-react';
import { getAllProducts } from '../../lib/api';

const stageTypeMap: Record<string, { color: string; bg: string }> = {
  CREATED: { color: 'text-accent-green', bg: 'bg-accent-green/10' },
  DISTRIBUTION: { color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  RETAIL: { color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
  RECALLED: { color: 'text-accent-red', bg: 'bg-accent-red/10' },
};

export default function Blockchain() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const withTx = products.filter((p) => p.blockchain_tx);
  const confirmed = withTx.length;
  const recalled = products.filter((p) => p.recalled).length;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blockchain Monitor</h1>
        <p className="text-gray-500 text-sm mt-0.5">On-chain transaction explorer & verification</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-blue/10"><Database size={16} className="text-accent-blue" /></div>
          <div>
            <p className="text-xs text-gray-500">Total Products</p>
            <p className="text-lg font-bold font-mono">{products.length}</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-green/10"><Hexagon size={16} className="text-accent-green" /></div>
          <div>
            <p className="text-xs text-gray-500">Network</p>
            <p className="text-lg font-bold">Polygon</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-amber/10"><Fuel size={16} className="text-accent-amber" /></div>
          <div>
            <p className="text-xs text-gray-500">On-chain Records</p>
            <p className="text-lg font-bold font-mono">{confirmed}</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-red/10"><Shield size={16} className="text-accent-red" /></div>
          <div>
            <p className="text-xs text-gray-500">Recalled</p>
            <p className="text-lg font-bold">{recalled}</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold">Product Blockchain Records</h3>
          <span className="text-[11px] text-gray-500">{withTx.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={24} className="animate-spin text-accent-green" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Product</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Stage</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Tx Hash</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">IPFS Hash</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Trust</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-600 text-sm">
                      No products on chain yet
                    </td>
                  </tr>
                )}
                {products.map((p, i) => {
                  const tc = stageTypeMap[p.current_stage] || stageTypeMap.CREATED;
                  return (
                    <motion.tr
                      key={p.product_id || p._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{p.product_id}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tc.bg} ${tc.color}`}>
                          {p.current_stage}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {p.blockchain_tx ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono text-accent-blue">
                              {String(p.blockchain_tx).slice(0, 12)}...
                            </span>
                            <button onClick={() => copy(p.blockchain_tx)} className="text-gray-600 hover:text-white transition-colors">
                              {copied === p.blockchain_tx ? <CheckCircle size={10} className="text-accent-green" /> : <Copy size={10} />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-600">Not recorded</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {p.ipfs_hash ? (
                          <span className="text-xs font-mono text-gray-400">
                            {String(p.ipfs_hash).slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono" style={{ color: (p.trust_score || 0) >= 80 ? '#00FF88' : '#EF4444' }}>
                          {p.trust_score || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {p.recalled ? (
                            <><XCircle size={12} style={{ color: '#EF4444' }} /><span className="text-[11px] text-accent-red">Recalled</span></>
                          ) : p.anomaly_flag ? (
                            <><XCircle size={12} style={{ color: '#F59E0B' }} /><span className="text-[11px] text-accent-amber">Flagged</span></>
                          ) : (
                            <><CheckCircle size={12} style={{ color: '#00FF88' }} /><span className="text-[11px] text-accent-green">Active</span></>
                          )}
                        </div>
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
