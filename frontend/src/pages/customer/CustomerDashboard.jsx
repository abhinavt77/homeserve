import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import BookingReceiptModal from '../../components/customer/BookingReceiptModal';
import AddressManager from '../../components/customer/AddressManager';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  PlayCircle,
  AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
  CreditCard,
  Star,
  Receipt
} from 'lucide-react';

const statusBadges = {
  PENDING: { label: 'Finding Tech', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  ACCEPTED: { label: 'Assigned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  ON_THE_WAY: { label: 'On The Way', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  PAID: { label: 'Paid', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  EXPIRED: { label: 'Expired', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/customer/bookings');
        if (res.data?.success) {
          setBookings(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load customer bookings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Customer Portal</span>
          <h1 className="text-3xl font-black mt-1">Hello, {user?.fullName}!</h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Request trusted electricians, plumbers, and home cleaners. Track technician arrival live on the map.
          </p>
        </div>

        <Link
          to="/customer/book"
          className="px-6 py-3.5 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Book a Service</span>
        </Link>
      </div>

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            My Service Requests
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {bookings.length} Total Bookings
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No service bookings yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Need a quick electrical fix or plumbing repair? Create your first service booking in less than a minute.
              </p>
            </div>
            <Link
              to="/customer/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Book Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((b) => {
              const badge = statusBadges[b.status] || { label: b.status, color: 'bg-slate-100 text-slate-800' };
              return (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                          {b.trackingNumber}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {b.category.name}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {b.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{b.address.street}, {b.address.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Estimated</span>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        ₹{b.finalCost || b.estimatedCost}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptBooking(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                        title="View Official Receipt / Tax Invoice"
                      >
                        <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Receipt</span>
                      </button>

                      {b.status === 'COMPLETED' && (
                        <Link
                          to={`/customer/payment/${b.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay</span>
                        </Link>
                      )}

                      {(b.status === 'COMPLETED' || b.status === 'PAID') && (
                        <Link
                          to={`/customer/review/${b.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Review</span>
                        </Link>
                      )}

                      <Link
                        to={`/customer/track/${b.trackingNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors"
                      >
                        <span>Track</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              My Saved Addresses
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your delivery and service addresses. Add your location using GPS or OpenStreetMap.
            </p>
          </div>
        </div>

        <AddressManager />
      </div>

      {/* Booking Receipt Modal */}
      {selectedReceiptBooking && (
        <BookingReceiptModal
          booking={selectedReceiptBooking}
          onClose={() => setSelectedReceiptBooking(null)}
        />
      )}
    </div>
  );
}
