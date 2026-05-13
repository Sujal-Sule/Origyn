import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, ShieldAlert, ScanLine, Coins, Hexagon,
  Activity, AlertTriangle, ArrowRight, CheckCircle, XCircle, Truck, Loader2, Globe
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar
} from 'recharts';
import { getStats, getActivity, getAdminAlerts, getAnalytics } from '../../lib/api';
import { Link } from 'react-router-dom';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const activityIcons: Record<string, { icon: typeof Package; color: string }> = {
  registration: { icon: Package, color: '#3B82F6' },
  scan: { icon: ScanLine, color: '#8B5CF6' },
  update: { icon: Activity, color: '#06B6D4' },
  anomaly: { icon: AlertTriangle, color: '#EF4444' },
  recall: { icon: XCircle, color: '#EF4444' },
  token: { icon: Coins, color: '#F59E0B' },
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MainDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, act, al, ana] = await Promise.all([
          getStats(), getActivity(), getAdminAlerts(), getAnalytics()
        ]);
        setStats(s);
        setActivity(act);
        setAlerts(al);
        setAnalytics(ana);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = stats ? [
    { title: 'Total Products', value: stats.total_products.toLocaleString(), icon: Package, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
    { title: 'Active Shipments', value: stats.active_shipments.toLocaleString(), icon: Truck, color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
    { title: 'Fake Attempts', value: stats.fake_attempts.toLocaleString(), icon: ShieldAlert, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
    { title: 'Total Scans', value: stats.total_scans.toLocaleString(), icon: ScanLine, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
    { title: 'Avg Trust Score', value: String(stats.avg_trust_score), icon: CheckCircle, color: '#00FF88', bg: 'rgba(0,255,136,0.08)' },
    { title: 'Chain Txns', value: stats.blockchain_txs.toLocaleString(), icon: Hexagon, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  ] : [];

  const critAlerts = alerts.filter((a) => a.status === 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-accent-green" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time supply chain intelligence</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          Live
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <div key={s.title} className="glass-panel p-4 group hover:border-white/[0.12] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: s.bg }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{s.value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{s.title}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts + Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scans Chart */}
        <motion.div variants={item} className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold">Scans &amp; Anomalies (7 Days)</h3>
            <span className="text-[11px] text-gray-500">Live data</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.scans_per_day || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="#4b5563" tick={{ fontSize: 11 }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#00FF88" strokeWidth={2} fill="url(#gScans)" />
                <Area type="monotone" dataKey="anomalies" stroke="#EF4444" strokeWidth={2} fill="url(#gAnomalies)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Feed */}
        <motion.div variants={item} className="glass-panel p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
              </span>
              Live Activity
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[260px]">
            {activity.length === 0 && (
              <p className="text-xs text-gray-600 text-center mt-8">No activity yet</p>
            )}
            {activity.map((evt) => {
              const meta = activityIcons[evt.type] || activityIcons.update;
              const Icon = meta.icon;
              return (
                <div key={evt.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800/70 transition-colors">
                  <div className="p-1.5 rounded-md mt-0.5" style={{ backgroundColor: `${meta.color}15` }}>
                    <Icon size={12} style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-300 leading-relaxed">{evt.message}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{timeAgo(evt.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Alerts + Region Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical Alerts */}
        <motion.div variants={item} className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={14} className="text-accent-red" />
              Active Alerts
              {critAlerts.length > 0 && (
                <span className="text-[10px] font-bold bg-accent-red/10 text-accent-red px-1.5 py-0.5 rounded-full">
                  {critAlerts.length}
                </span>
              )}
            </h3>
            <Link to="/dashboard/alerts" className="text-[11px] text-accent-green hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {critAlerts.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-4">No active alerts</p>
            )}
            {critAlerts.slice(0, 4).map((a) => (
              <div key={a._id} className="p-3 rounded-xl border border-accent-red/20 bg-accent-red/[0.04] hover:border-opacity-40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-red/10 text-accent-red">
                    {a.severity || 'HIGH'}
                  </span>
                  <span className="text-[10px] text-gray-600">{a.created_at ? timeAgo(a.created_at) : ''}</span>
                </div>
                <p className="text-xs font-medium text-white">{a.message}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{a.product_id || ''}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Analytics - Trust Distribution */}
        <motion.div variants={item} className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Trust Score Distribution</h3>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.trust_distribution || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="range" stroke="#4b5563" tick={{ fontSize: 10 }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#00FF88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick link to Map Page */}
      <motion.div variants={item} className="glass-panel overflow-hidden">
        <Link to="/dashboard/map" className="block no-underline">
          <div className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                <Globe size={18} className="text-accent-green" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Supply Chain Map</h3>
                <p className="text-[11px] text-gray-500">View live product locations & journey tracking</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-accent-green" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
