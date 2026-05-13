import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Hexagon, ScanLine, MapPin, Brain, ArrowRight } from 'lucide-react';

const features = [
  { icon: Hexagon, title: 'Blockchain Verified', desc: 'Every product on-chain with Polygon' },
  { icon: Brain, title: 'AI Anomaly Detection', desc: 'Real-time fraud & counterfeit alerts' },
  { icon: MapPin, title: 'Live Map Tracking', desc: 'Full journey visualization on maps' },
  { icon: ScanLine, title: 'DCQR Innovation', desc: 'Dynamic cloneable QR — unhackable' },
  { icon: Shield, title: 'Recall System', desc: 'Instant enterprise product recalls' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-950 overflow-hidden relative text-white">
      {/* Grid bg */}
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00FF88" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-green/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/[0.06] border border-accent-green/10 text-accent-green text-xs font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Supply Chain Command Center
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-green via-emerald-400 to-accent-blue">
            ORIGYN
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light max-w-lg mx-auto">
            Every product has a story. We make sure it's the truth.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mb-8 max-w-2xl">
          {features.map(f => (
            <div key={f.title} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800/40 border border-white/[0.04] text-xs text-gray-400">
              <f.icon size={12} className="text-accent-green" />
              {f.title}
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="flex flex-col sm:flex-row gap-3">
          <Link to="/auth/login" className="px-8 py-3.5 bg-accent-green text-navy-950 font-bold rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_30px_rgba(0,255,136,0.3)] flex items-center gap-2">
            Admin Login <ArrowRight size={16} />
          </Link>
          <Link to="/auth/login" className="px-8 py-3.5 bg-navy-800/60 border border-white/[0.08] font-medium rounded-xl hover:bg-navy-700 transition-colors">
            Regulator Access
          </Link>
        </motion.div>
      </main>

      {/* Ticker */}
      <div className="absolute bottom-0 left-0 w-full bg-navy-800/60 backdrop-blur-xl border-t border-white/[0.06] py-3 overflow-hidden">
        <div className="flex gap-16 whitespace-nowrap animate-marquee px-4 text-xs font-mono text-accent-green/70">
          <span>2,400 Products Tracked</span><span>•</span>
          <span>18.2K Total Scans</span><span>•</span>
          <span>47 Fraud Attempts Blocked</span><span>•</span>
          <span>94.2 Avg Trust Score</span><span>•</span>
          <span>9,841 Blockchain Txns</span><span>•</span>
          <span>2,400 Products Tracked</span><span>•</span>
          <span>18.2K Total Scans</span><span>•</span>
          <span>47 Fraud Attempts Blocked</span>
        </div>
      </div>
    </div>
  );
}
