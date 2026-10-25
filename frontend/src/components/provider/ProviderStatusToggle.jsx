import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Power,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ProviderStatusToggle() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/provider/profile');
      if (res.data?.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load provider profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleAvailability = async () => {
    if (!profile) return;
    if (!profile.isVerified) {
      alert('Your account is awaiting Admin verification before going online.');
      return;
    }

    setUpdating(true);
    setMsg('');
    try {
      const nextStatus = !profile.isOnline;
      const res = await api.patch('/provider/profile/availability', { isOnline: nextStatus });
      if (res.data?.success) {
        setProfile(res.data.data);
        updateUser({ isOnline: nextStatus });
        setMsg(`Status updated: You are now ${nextStatus ? 'ONLINE' : 'OFFLINE'}`);
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const setProviderCoords = async (lat, lng) => {
    try {
      const res = await api.patch('/provider/profile/location', {
        latitude: lat,
        longitude: lng,
      });
      if (res.data?.success) {
        setProfile(res.data.data);
        setMsg(`Location updated: ${lat}, ${lng}`);
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {
      alert('Failed to update GPS on server');
    }
  };

  const updateCurrentGps = () => {
    setMsg('Detecting location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          setProviderCoords(lat, lng);
        },
        async () => {
          // Fallback to IP Geolocation
          try {
            const ipRes = await fetch('https://ipwho.is/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData && ipData.latitude && ipData.longitude) {
                setProviderCoords(ipData.latitude, ipData.longitude);
                return;
              }
            }
          } catch (e) {
            console.warn(e);
          }
          // Default to Bangalore center
          setProviderCoords(12.9716, 77.5946);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setProviderCoords(12.9716, 77.5946);
    }
  };

  if (loading) {
    return <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl animate-pulse h-28"></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md transition-colors space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Profile Summary */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-200 dark:border-indigo-800">
            {profile?.categoryName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {profile?.fullName || user?.fullName}
              </h2>
              {profile?.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pending Approval
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {profile?.categoryName} • {profile?.experienceYears} yrs experience • ₹{profile?.hourlyRate}/hr
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={updating || !profile?.isVerified}
            onClick={toggleAvailability}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md ${
              profile?.isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-4 ring-emerald-500/20'
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200'
            } disabled:opacity-50`}
          >
            <Power className="w-4 h-4" />
            <span>{profile?.isOnline ? 'Online (Accepting Jobs)' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {/* Live GPS row */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span>
            Current Base Location: <strong>{profile?.latitude || 12.9716}, {profile?.longitude || 77.5946}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={updateCurrentGps}
          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          <Navigation className="w-3.5 h-3.5" />
          Broadcast Current GPS
        </button>
      </div>

      {msg && (
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 animate-fade-in">
          ✓ {msg}
        </div>
      )}
    </div>
  );
}
