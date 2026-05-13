import { create } from 'zustand';

type Role = 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'admin' | null;

interface User {
  id: string;
  name: string;
  role: Role;
  phone: string;
  tokens?: number;
}

interface AppState {
  user: User | null;
  token: string | null;
  role: Role;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRole: (role: Role) => void;
  login: (role: Role) => void;
  logout: () => void;
}

const DEMO_ACCOUNTS: Record<string, User> = {
  farmer: { id: 'demo-farmer', name: 'Rajesh Kumar', role: 'farmer', phone: '+919876543210', tokens: 2450 },
  distributor: { id: 'demo-dist', name: 'Priya Logistics', role: 'distributor', phone: '+919876543211', tokens: 1800 },
  retailer: { id: 'demo-retail', name: 'FreshMart Store', role: 'retailer', phone: '+919876543212', tokens: 920 },
  consumer: { id: 'demo-consumer', name: 'Ananya Sharma', role: 'consumer', phone: '+919876543213', tokens: 1450 },
  admin: { id: 'demo-admin', name: 'System Admin', role: 'admin', phone: '+919876543214', tokens: 5000 },
};

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  role: null,
  setUser: (user) => set({ user, role: user?.role || null }),
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
  login: (role) => {
    // Legacy support for demo roles if needed, but we should use setUser now
    const user = DEMO_ACCOUNTS[role as string] || DEMO_ACCOUNTS.consumer;
    set({ user, role: user.role, token: 'demo-token' });
  },
  logout: () => set({ user: null, token: null, role: null }),
}));
