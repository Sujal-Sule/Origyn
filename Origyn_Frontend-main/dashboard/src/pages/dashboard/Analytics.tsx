import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { getAnalytics } from '../../lib/api';
import { BarChart3, TrendingUp, PieChart as PieIcon, Globe, Loader2 } from 'lucide-react';

const COLORS = ['#00FF88', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-accent-green" />
      </div>
    );
  }

  const alertsByType = data?.alerts_by_type
    ? Object.entries(data.alerts_by_type).map(([type, count]) => ({ type, count }))
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Supply chain intelligence & performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scans per Day */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-accent-green" />
            <h3 className="text-sm font-semibold">Scans & Anomalies (7 Days)</h3>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.scans_per_day || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gScansA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAnomaliesA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="#4b5563" tick={{ fontSize: 11 }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="scans" stroke="#00FF88" strokeWidth={2} fill="url(#gScansA)" name="Scans" />
                <Area type="monotone" dataKey="anomalies" stroke="#EF4444" strokeWidth={2} fill="url(#gAnomaliesA)" name="Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Trust Score Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={14} className="text-accent-blue" />
            <h3 className="text-sm font-semibold">Trust Score Distribution</h3>
          </div>
          {(data?.trust_distribution || []).every((d: any) => d.count === 0) ? (
            <div className="h-[240px] flex items-center justify-center text-gray-600 text-sm">
              No product data yet
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.trust_distribution || []}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    strokeWidth={0}
                  >
                    {(data?.trust_distribution || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Alerts by Type */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-accent-red" />
            <h3 className="text-sm font-semibold">Alerts by Type</h3>
          </div>
          {alertsByType.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-gray-600 text-sm">
              No alerts recorded yet
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertsByType} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="type" stroke="#4b5563" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Trust Range Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={14} className="text-accent-cyan" />
            <h3 className="text-sm font-semibold">Trust Score Breakdown</h3>
          </div>
          <div className="space-y-3">
            {(data?.trust_distribution || []).map((r: any, i: number) => {
              const total = (data?.trust_distribution || []).reduce((s: number, x: any) => s + x.count, 0);
              const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
              return (
                <div key={r.range} className="flex items-center justify-between p-3 rounded-xl bg-navy-950/40 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <p className="text-sm font-medium">Score {r.range}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 rounded-full bg-navy-600 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 w-8 text-right">{r.count}</span>
                  </div>
                </div>
              );
            })}
            {(data?.trust_distribution || []).every((d: any) => d.count === 0) && (
              <p className="text-sm text-gray-600 text-center py-4">Register products to see data</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
