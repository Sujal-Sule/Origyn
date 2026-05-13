import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Globe, Shield, Bell, Palette, Hexagon, Wifi } from 'lucide-react';

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure your Origyn command center</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-accent-green text-navy-950 text-xs font-bold flex items-center gap-1.5 hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(0,255,136,0.2)]">
          <Save size={14} /> Save Changes
        </button>
      </div>

      {/* Smart Contract */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Hexagon size={14} className="text-accent-green" /> Smart Contract Configuration
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">RPC Endpoint</label>
            <input type="text" className="w-full bg-navy-950/60 border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent-green/40 transition-colors" defaultValue="https://polygon-rpc.com" />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Contract Address</label>
            <input type="text" className="w-full bg-navy-950/60 border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent-green/40 transition-colors" defaultValue="0x4b7a2f1c3d5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a" />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Network</label>
            <select className="w-full bg-navy-950/60 border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-green/40 transition-colors">
              <option>Polygon Mainnet</option>
              <option>Polygon Mumbai (Testnet)</option>
              <option>Ethereum Mainnet</option>
            </select>
          </div>
        </div>
      </div>

      {/* IoT */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Wifi size={14} className="text-accent-blue" /> IoT Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">WebSocket Endpoint</label>
            <input type="text" className="w-full bg-navy-950/60 border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent-green/40 transition-colors" defaultValue="ws://localhost:8000/ws/iot" />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Temperature Threshold (°C)</label>
            <input type="number" className="w-full bg-navy-950/60 border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-green/40 transition-colors" defaultValue="8" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Bell size={14} className="text-accent-amber" /> Notifications
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Critical alerts', desc: 'Temperature breaches, fraud detection', defaultChecked: true },
            { label: 'Product updates', desc: 'New registrations, stage changes', defaultChecked: true },
            { label: 'Blockchain events', desc: 'Transaction confirmations', defaultChecked: false },
            { label: 'Token rewards', desc: 'New token issuances', defaultChecked: false },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between p-3 rounded-xl bg-navy-950/40 border border-white/[0.04]">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-[11px] text-gray-500">{n.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${n.defaultChecked ? 'bg-accent-green/30' : 'bg-navy-600'}`}>
                <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${n.defaultChecked ? 'right-0.5 bg-accent-green' : 'left-0.5 bg-gray-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UI */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Palette size={14} className="text-accent-purple" /> UI Preferences
        </h3>
        <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950/40 border border-white/[0.04]">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-[11px] text-gray-500">Command center optimized for dark environments</p>
          </div>
          <div className="w-10 h-5 rounded-full relative cursor-pointer bg-accent-green/30">
            <div className="w-4 h-4 rounded-full absolute top-0.5 right-0.5 bg-accent-green" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
