import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import axios from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/AppShell';
import { Loader2 } from 'lucide-react';

// Lazy loaded feature pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ServiceListPage = lazy(() => import('@/features/services/pages/ServiceListPage').then(m => ({ default: m.ServiceListPage })));
const CustomerDashboard = lazy(() => import('@/features/bookings/pages/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const CustomerBookingPage = lazy(() => import('@/features/bookings/pages/CustomerBookingPage').then(m => ({ default: m.CustomerBookingPage })));
const TechnicianDashboard = lazy(() => import('@/features/bookings/pages/TechnicianDashboard').then(m => ({ default: m.TechnicianDashboard })));
const LiveTrackingPage = lazy(() => import('@/features/bookings/pages/LiveTrackingPage').then(m => ({ default: m.LiveTrackingPage })));
const EarningsDashboard = lazy(() => import('@/features/earnings/pages/EarningsDashboard').then(m => ({ default: m.EarningsDashboard })));

const AdminLayout = lazy(() => import('@/components/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLiveMap = lazy(() => import('@/features/admin/pages/AdminLiveMap').then(m => ({ default: m.AdminLiveMap })));

const Unauthorized = () => {
  const { user } = useAuthStore();
  const getDashboardLink = () => {
    if (user?.roles.includes('admin')) return '/admin/dashboard';
    if (user?.roles.includes('technician')) return '/technician/dashboard';
    return '/dashboard';
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 text-center">
      <div className="rounded-full bg-destructive/10 p-6 mb-4">
        <span className="text-4xl text-destructive">⚠️</span>
      </div>
      <h1 className="text-3xl font-bold">Unauthorized Access</h1>
      <p className="text-muted-foreground max-w-md">You don't have permission to view this page. Please return to your dashboard.</p>
      <a href={getDashboardLink()} className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Go to Dashboard
      </a>
    </div>
  );
};
// Premium Suspense Fallback
const PageFallback = () => (
  <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground animate-pulse">Loading experience...</p>
  </div>
);

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/v1/auth/me');
        setUser(response.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes inside AppShell */}
          <Route element={<AppShell />}>
            
            {/* Customer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/dashboard/services" element={<ServiceListPage />} />
              <Route path="/dashboard/book" element={<CustomerBookingPage />} />
              <Route path="/dashboard/tracking/:id" element={<LiveTrackingPage />} />
            </Route>

            {/* Technician Routes */}
            <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
              <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
              <Route path="/technician/earnings" element={<EarningsDashboard />} />
            </Route>

          </Route>

          {/* Admin Routes (Uses separate AdminLayout) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/map" element={<AdminLiveMap />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
