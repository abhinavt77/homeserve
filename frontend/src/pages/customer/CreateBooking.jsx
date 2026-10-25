import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AddressManager from '../../components/customer/AddressManager';
import {
  Wrench,
  Zap,
  Droplet,
  Sparkles,
  Hammer,
  Tv,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  IndianRupee,
  CheckCircle2
} from 'lucide-react';

const categoryIcons = {
  ELECTRICIAN: Zap,
  PLUMBER: Droplet,
  CLEANER: Sparkles,
  CARPENTER: Hammer,
  APPLIANCE_REPAIR: Tv,
};

export default function CreateBooking() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState('NOW'); // 'NOW' or 'LATER'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedCategory(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError('Please select a service category');
      return;
    }
    if (!selectedAddress) {
      setError('Please select or add a service address');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description of the issue');
      return;
    }

    let scheduledAt = null;
    if (scheduleType === 'LATER') {
      if (!scheduledDate || !scheduledTime) {
        setError('Please choose both date and time for scheduled booking');
        return;
      }
      scheduledAt = `${scheduledDate}T${scheduledTime}:00`;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        categoryId: selectedCategory.id,
        addressId: selectedAddress.id,
        description: description.trim(),
        scheduledAt,
      };

      const res = await api.post('/customer/bookings', payload);
      if (res.data?.success && res.data?.data) {
        const booking = res.data.data;
        // Navigate directly to live tracking page with receipt modal automatically open!
        navigate(`/customer/track/${booking.trackingNumber}?receipt=true`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Book a Home Service
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Select your service, pinpoint your location, and connect with verified local technicians
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Step 1: Service Category Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Select Service Type
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.code] || Wrench;
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    From ₹{cat.basePrice}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Address Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Confirm Service Address
            </h2>
            {selectedAddress && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Address Chosen: {selectedAddress.title}</span>
              </span>
            )}
          </div>

          <AddressManager
            onSelectAddress={(addr) => setSelectedAddress(addr)}
            selectedAddressId={selectedAddress?.id}
          />
        </div>

        {/* Step 3: Issue Description & Scheduling */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Describe Problem & Timing
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Describe the issue in detail
            </label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master bedroom ceiling fan stopped rotating, sparks coming from switch board..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              When do you need the service?
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setScheduleType('NOW')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  scheduleType === 'NOW'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                Book Now (Urgent)
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('LATER')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  scheduleType === 'LATER'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Schedule Later
              </button>
            </div>

            {scheduleType === 'LATER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Pick Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Preferred Time Window</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Summary & Submit */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Estimated Base Fare</span>
            <div className="text-3xl font-black mt-1 flex items-center gap-1">
              ₹{selectedCategory?.basePrice || 299}
              <span className="text-xs font-normal text-slate-300"> (final cost confirmed after inspection)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Pay online via Razorpay or Cash upon completion
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Broadcast Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
