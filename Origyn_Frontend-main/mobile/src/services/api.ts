import axios from 'axios';
import Constants from 'expo-constants';
import { useStore } from '../store/useStore';

function getBaseUrl(): string {
  // In Expo Go / dev builds, Metro's hostUri is the Mac's LAN IP:port (e.g. "192.168.1.5:8081")
  // Backend runs on the same machine — same IP, port 8000.
  const hostUri =
    Constants.expoConfig?.hostUri ??          // Expo SDK 49+
    (Constants.manifest2 as any)?.extra?.expoClient?.hostUri ?? // SDK 48
    (Constants.manifest as any)?.debuggerHost; // older SDKs

  if (hostUri) {
    const ip = hostUri.split(':')[0]; // strip the :8081 metro port
    return `http://${ip}:8000/api`;
  }

  // Fallback for production / standalone builds
  return 'http://localhost:8000/api';
}

const BASE_URL = getBaseUrl();
console.log('[API] Base URL:', BASE_URL);

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
api.interceptors.request.use(async (config) => {
  try {
    const token = useStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default api;
export { BASE_URL };
