import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateBooking from './pages/customer/CreateBooking';
import TrackBooking from './pages/customer/TrackBooking';
import PaymentPage from './pages/customer/PaymentPage';
import ReviewPage from './pages/customer/ReviewPage';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  React.useEffect(() => {
    // 1. Pre-warm backend immediately on page arrival to eliminate cold start latency
    const warmUpBackend = () => {
      fetch('https://homeserve-backend-ss0m.onrender.com/api/categories', { mode: 'cors' }).catch(() => {});
    };
    warmUpBackend();

    // 2. Keep backend warm by pinging every 4 minutes while browser tab is open
    const interval = setInterval(warmUpBackend, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Routes */}
                <Route
                  path="/customer"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/book"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <CreateBooking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/track/:trackingNumber"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <TrackBooking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/payment/:bookingId"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/pay/:bookingId"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/review/:bookingId"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <ReviewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Routes */}
                <Route
                  path="/provider/*"
                  element={
                    <ProtectedRoute allowedRoles={['PROVIDER']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
