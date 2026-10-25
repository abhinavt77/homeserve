import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useWebSocket } from '../../hooks/useWebSocket';
import BookingReceiptModal from '../../components/customer/BookingReceiptModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Wrench,
  Clock,
  CheckCircle,
  Truck,
  PlayCircle,
  CreditCard,
  XCircle,
  AlertCircle,
  Phone,
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Receipt,
  X
} from 'lucide-react';

const customerMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const providerMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Requested', icon: Clock },
  { key: 'ACCEPTED', label: 'Provider Assigned', icon: CheckCircle },
  { key: 'ON_THE_WAY', label: 'On The Way', icon: Truck },
  { key: 'IN_PROGRESS', label: 'Service In Progress', icon: PlayCircle },
  { key: 'COMPLETED', label: 'Completed', icon: ShieldCheck },
  { key: 'PAID', label: 'Paid & Reviewed', icon: CreditCard },
];

export default function TrackBooking() {
  const { trackingNumber } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Receipt Modal state
  const [showReceiptModal, setShowReceiptModal] = useState(() => {
    return new URLSearchParams(location.search).get('receipt') === 'true';
  });

  // Cancel dialog
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const navigate = useNavigate();
  const { subscribe } = useWebSocket();

  const fetchBooking = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get(`/customer/bookings/track/${trackingNumber}`);
      if (res.data?.success) {
        setBooking(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tracking details');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Subscribe to live WebSocket tracking updates
    const unsub = subscribe(`/topic/tracking/${trackingNumber}`, (updated) => {
      if (updated && updated.trackingNumber === trackingNumber) {
        setBooking(updated);
      }
    });

    // Backup polling fallback
    const interval = setInterval(() => {
      fetchBooking();
    }, 6000);

    return () => {
      if (unsub) unsub();
      clearInterval(interval);
    };
  }, [trackingNumber, subscribe]);

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    setCancelling(true);
    try {
      const res = await api.patch(`/customer/bookings/${booking.id}/cancel`, {
        reason: cancelReason.trim(),
      });
      if (res.data?.success) {
        setBooking(res.data.data);
        setShowCancelModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const getStepStatus = (stepKey) => {
    if (!booking) return 'pending';
    const statusOrder = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'PAID'];
    const currentIndex = statusOrder.indexOf(booking.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      return 'cancelled';
    }

    if (currentIndex >= stepIndex) return 'completed';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Could not locate tracking information'}</p>
        <Link to="/customer" className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const customerPos = [booking.address.latitude, booking.address.longitude];
  const providerPos = booking.provider?.latitude && booking.provider?.longitude
    ? [booking.provider.latitude, booking.provider.longitude]
    : customerPos;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {booking.category.name} Service
            </h1>
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
              {booking.trackingNumber}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Booked on {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Formal Receipt Button */}
          <button
            type="button"
            onClick={() => setShowReceiptModal(true)}
            className="px-3.5 py-2 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Receipt className="w-4 h-4" />
            <span>Booking Receipt / Invoice</span>
          </button>

          <button
            onClick={() => fetchBooking(true)}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold"
            >
              Cancel Request
            </button>
          )}

          {booking.status === 'COMPLETED' && (
            <Link
              to={`/customer/payment/${booking.id}`}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              Pay ₹{booking.finalCost || booking.estimatedCost}
            </Link>
          )}
        </div>
      </div>

      {/* Special Banner for CANCELLED or EXPIRED */}
      {booking.status === 'CANCELLED' && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300">Request Cancelled</h4>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              Reason: {booking.cancellationReason || 'Cancelled by user.'}
            </p>
          </div>
        </div>
      )}

      {booking.status === 'EXPIRED' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">Request Expired</h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              No nearby technician was able to accept your job in time. Please try booking again.
            </p>
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
          Real-Time Progress Timeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const status = getStepStatus(step.key);

            let bgClass = 'bg-slate-100 dark:bg-slate-700 text-slate-400';
            if (status === 'completed') {
              bgClass = 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
            } else if (booking.status === step.key) {
              bgClass = 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 animate-pulse';
            }

            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${bgClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${
                  status === 'completed' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Map & Provider Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Live Geospatial Dispatch
            </h3>
            <span className="text-xs text-slate-500">
              Search Radius: {booking.searchRadiusKm} km
            </span>
          </div>

          <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <MapContainer
              center={customerPos}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Customer Pin */}
              <Marker position={customerPos} icon={customerMarkerIcon}>
                <Popup>
                  <strong>Service Address:</strong><br />
                  {booking.address.street}, {booking.address.city}
                </Popup>
              </Marker>

              {/* Provider Pin (if assigned) */}
              {booking.provider && (
                <Marker position={providerPos} icon={providerMarkerIcon}>
                  <Popup>
                    <strong>{booking.provider.fullName}</strong><br />
                    Technician Location
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span>Your Address</span>
            </div>
            {booking.provider && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Assigned Technician ({booking.provider.fullName})</span>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Provider Profile Card (1 Col) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Assigned Specialist
            </h3>

            {booking.provider ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                    {booking.provider.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {booking.provider.fullName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                        {booking.provider.averageRating || '5.0'}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({booking.provider.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold">{booking.provider.experienceYears} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hourly Rate:</span>
                    <span className="font-semibold">₹{booking.provider.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Phone:</span>
                    <a
                      href={`tel:${booking.provider.phone}`}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {booking.provider.phone}
                    </a>
                  </div>
                </div>

                {booking.provider.bio && (
                  <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100 dark:border-slate-700">
                    "{booking.provider.bio}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                  <Wrench className="w-6 h-6 animate-spin" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Searching Nearby Providers...
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pushed to certified technicians within {booking.searchRadiusKm} km. First to accept will be dispatched immediately.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Problem:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 max-w-[180px] truncate text-right">
                {booking.description}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Estimated Fare:</span>
              <span>₹{booking.finalCost || booking.estimatedCost}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cancel Service Request
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Please share why you need to cancel this service request:
            </p>

            <form onSubmit={handleCancelBooking} className="space-y-4">
              <textarea
                rows="3"
                required
                placeholder="e.g. Issue resolved on my own, booked another date..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Booking Receipt Modal */}
      {showReceiptModal && (
        <BookingReceiptModal
          booking={booking}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
