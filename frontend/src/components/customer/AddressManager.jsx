import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LocationPickerMap from '../map/LocationPickerMap';
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  X,
  AlertCircle,
  Check,
  Building,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AddressManager({ onSelectAddress, selectedAddressId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMode, setShowAddMode] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState(selectedAddressId);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [title, setTitle] = useState('Home');
  const [street, setStreet] = useState('Flat 402, Sunshine Residency, 100ft Road');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560038');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [isDefault, setIsDefault] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedAddressId) {
      setInternalSelectedId(selectedAddressId);
    }
  }, [selectedAddressId]);

  const fetchAddresses = async (preferredSelectId = null) => {
    try {
      const res = await api.get('/customer/addresses');
      if (res.data?.success) {
        const list = res.data.data || [];
        setAddresses(list);

        if (list.length > 0) {
          const targetId = preferredSelectId || internalSelectedId || selectedAddressId;
          let target = list.find((a) => a.id === targetId);
          if (!target) {
            target = list.find((a) => a.isDefault) || list[0];
          }

          if (target) {
            setInternalSelectedId(target.id);
            if (onSelectAddress) {
              onSelectAddress(target);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load customer addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Sync coordinates and address fields from map / GPS / search
  const handleLocationChange = (loc) => {
    if (loc.latitude && loc.longitude) {
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
    }
    if (loc.street) setStreet(loc.street);
    if (loc.city) setCity(loc.city);
    if (loc.state) setState(loc.state);
    if (loc.postalCode) setPostalCode(loc.postalCode);
  };

  const handleSelectCard = (addr, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setInternalSelectedId(addr.id);
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
    setSuccessMessage(`Selected "${addr.title}" for this service booking!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAddAddress = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setError('');
    setSuccessMessage('');

    const finalStreet = street.trim() || 'Main Road Area';
    const finalCity = city.trim() || 'Bangalore';
    const finalPostalCode = postalCode.trim() || '560001';
    const finalState = state.trim() || 'Karnataka';

    setSubmitting(true);

    try {
      const payload = {
        title: title || 'Home',
        street: finalStreet,
        city: finalCity,
        state: finalState,
        postalCode: finalPostalCode,
        latitude,
        longitude,
        isDefault,
      };

      console.log('Submitting new address payload:', payload);
      const res = await api.post('/customer/addresses', payload);
      console.log('Address saved response:', res.data);

      if (res.data?.success && res.data?.data) {
        const saved = res.data.data;

        // 1. Immediately update internal selection
        setInternalSelectedId(saved.id);

        // 2. Immediately notify parent (CreateBooking) so button is ready
        if (onSelectAddress) {
          onSelectAddress(saved);
        }

        // 3. Immediately prepend to local list so card appears instantly
        setAddresses((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
        setShowAddMode(false);
        setSuccessMessage(`✓ Address "${saved.title}" saved and selected for booking!`);

        // 4. Sync from server
        try {
          const freshRes = await api.get('/customer/addresses');
          if (freshRes.data?.success && freshRes.data?.data) {
            setAddresses(freshRes.data.data);
          }
        } catch (syncErr) {
          console.warn('Sync addresses error:', syncErr);
        }

        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Failed to save address:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.map(e => e.defaultMessage).join(', ') || 'Failed to save address. Please verify your inputs.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      await api.patch(`/customer/addresses/${id}/default`);
      fetchAddresses(id);
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/customer/addresses/${id}`);
      const remaining = addresses.filter((a) => a.id !== id);
      setAddresses(remaining);
      if (internalSelectedId === id && remaining.length > 0) {
        handleSelectCard(remaining[0]);
      }
      fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeSelected = addresses.find((a) => a.id === internalSelectedId);
  const isFormOpen = showAddMode || addresses.length === 0;

  return (
    <div className="space-y-4">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Delivery & Service Address
          </h3>
          <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
            {addresses.length} Saved
          </span>
        </div>

        {addresses.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddMode(!showAddMode);
                setError('');
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
                showAddMode
                  ? 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {showAddMode ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>View Saved Addresses</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Active Selected Address Banner */}
      {activeSelected && !isFormOpen && (
        <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 truncate">
            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              ✓
            </span>
            <div className="truncate">
              <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                Selected for Booking: [{activeSelected.title}]
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                {activeSelected.street}, {activeSelected.city} - {activeSelected.postalCode}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex-shrink-0">
            Active
          </span>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Error */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MODE 1: Saved Addresses List (Only when there are saved addresses and form is closed) */}
      {!isFormOpen && addresses.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {addresses.map((addr) => {
              const isSelected = internalSelectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={(e) => handleSelectCard(addr, e)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-2 border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 ring-4 ring-indigo-500/20 shadow-md scale-[1.01]'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {addr.title.toLowerCase().includes('office') ? (
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Home className="w-4 h-4 text-indigo-600" />
                      )}
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {addr.title}
                      </span>

                      {isSelected && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Selected
                        </span>
                      )}

                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-bold">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => handleSetDefault(addr.id, e)}
                          className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(addr.id, e)}
                        title="Delete address"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium line-clamp-2 leading-relaxed">
                    {addr.street}, {addr.city}, {addr.state} - <span className="font-bold">{addr.postalCode}</span>
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">Coordinates: {addr.latitude.toFixed(4)}, {addr.longitude.toFixed(4)}</span>
                    <button
                      type="button"
                      onClick={(e) => handleSelectCard(addr, e)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ Using This' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: Add New Address (Map with Search Bar + Form) */}
      {isFormOpen && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-600" />
                {addresses.length === 0 ? 'Set Your Delivery Address' : 'Find & Pin New Address'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Search your colony or apartment, click <strong>"Use My Location"</strong>, or drag the marker. Form fields update instantly.
              </p>
            </div>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddMode(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {/* Interactive Map with Real-time Address Bar */}
          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
            height="270px"
          />

          {/* Address Details Container (NO nested <form> tag to prevent event conflicts) */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Address Label
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Parents House">Parents House</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 560038"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Street, Apartment / House No. & Landmark *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Sunshine Residency, 100ft Road, Indiranagar"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-semibold">Set as my default service address</span>
              </label>

              <div className="flex items-center gap-2">
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddMode(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddAddress}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Saving Address...' : 'Save & Select for Booking'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
