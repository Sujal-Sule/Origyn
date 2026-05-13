import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './pages/dashboard/Main';
import Products from './pages/dashboard/Products';
import ProductDetail from './pages/dashboard/ProductDetail';
import Alerts from './pages/dashboard/Alerts';
import Analytics from './pages/dashboard/Analytics';
import Users from './pages/dashboard/Users';
import IoTMonitor from './pages/dashboard/IoT';
import Blockchain from './pages/dashboard/Blockchain';
import TokenAnalytics from './pages/dashboard/TokenAnalytics';
import RecallManagement from './pages/dashboard/Recall';
import Settings from './pages/dashboard/Settings';
import MapView from './pages/dashboard/MapView';
import { useAuthStore } from './lib/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MainDashboard />} />
          <Route path="map" element={<MapView />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="recall" element={<RecallManagement />} />
          <Route path="users" element={<Users />} />
          <Route path="blockchain" element={<Blockchain />} />
          <Route path="tokens" element={<TokenAnalytics />} />
          <Route path="iot" element={<IoTMonitor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
