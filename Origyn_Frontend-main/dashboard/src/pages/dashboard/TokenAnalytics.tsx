import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { Coins, TrendingUp, Award, ScanLine, Loader2 } from 'lucide-react';
import { getTokenOverview } from '../../lib/api';

export default function TokenAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTokenOverview()
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

  const leaderboard: any[] = data?.leaderboard || [];
  const totalIssued: number = data?.total_issued ?? 0;
  const totalSpent: number = data?.total_spent ?? 0;
  const totalHeld = totalIssued - totalSpent;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Token Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">ORG token economy — scan-to-earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-accent-amber/10"><Coins size={14} className="text-accent-amber" /></div>
          </div>
          <p className="text-xl font-bold">{totalIssued.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500">Total ORG Earned</p>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-accent-red/10"><TrendingUp size={14} className="text-accent-red" /></div>
          </div>
          <p className="text-xl font-bold">{totalSpent.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500">Tokens Spent</p>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-accent-green/10"><ScanLine size={14} className="text-accent-green" /></div>
          </div>
          <p className="text-xl font-bold">{totalHeld.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500">Currently Held</p>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-accent-blue/10"><Award size={14} className="text-accent-blue" /></div>
          </div>
          <p className="text-xl font-bold">{leaderboard.length}</p>
          <p className="text-[11px] text-gray-500">Token Holders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leaderboard chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5">
          <h3 className="text-sm font-semibold mb-4">Token Balance by User</h3>
          {leaderboard.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-gray-600 text-sm">
              No token data yet
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaderboard.slice(0, 8)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 9 }} tickFormatter={(v) => v.split(' ')[0]} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
                  <Bar dataKey="tokens" fill="#F59E0B" radius={[6, 6, 0, 0]} name="ORG Balance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Earned vs Held */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-5">
          <h3 className="text-sm font-semibold mb-4">Earned vs Held per User</h3>
          {leaderboard.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-gray-600 text-sm">
              No token data yet
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leaderboard.slice(0, 8)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEarned2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gHeld" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 9 }} tickFormatter={(v) => v.split(' ')[0]} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="earned" stroke="#F59E0B" strokeWidth={2} fill="url(#gEarned2)" name="Earned" />
                  <Area type="monotone" dataKey="tokens" stroke="#8B5CF6" strokeWidth={2} fill="url(#gHeld)" name="Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Leaderboard Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={14} className="text-accent-amber" />
          <h3 className="text-sm font-semibold">Top Token Holders</h3>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-6">No token holders yet — users earn tokens by scanning products</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((u: any, i: number) => (
              <div key={u.name} className="flex items-center justify-between p-3 rounded-xl bg-navy-950/40 border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-[11px] text-gray-500">Earned: {u.earned} ORG</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins size={12} className="text-accent-amber" />
                  <span className="text-sm font-bold text-accent-amber">{u.tokens}</span>
                  <span className="text-[10px] text-gray-500">ORG</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
