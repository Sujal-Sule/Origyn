import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loginWithPhone } from '../../lib/api';
import { useAuthStore } from '../../lib/authStore';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginWithPhone(phone, password);
      setAuth(data.user, data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-green to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-16 h-16 mx-auto bg-gradient-to-tr from-accent-green to-blue-500 rounded-2xl mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)]"
          >
            <span className="text-navy-900 font-black text-2xl">O</span>
          </motion.div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-gray-400 mt-2">Log in to your Origyn account</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <div className="flex gap-2">
              <span className="bg-navy-900/50 border border-white/10 rounded-lg px-4 py-2 text-gray-400">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-navy-900/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-accent-green transition-colors"
                placeholder="98765 43210"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy-900/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-accent-green transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-accent-green text-navy-900 font-bold py-3 rounded-lg hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>
      </motion.div>

      <p className="mt-8 text-sm text-gray-500 relative z-10">Origyn Supply Chain Intelligence</p>
    </div>
  );
}
