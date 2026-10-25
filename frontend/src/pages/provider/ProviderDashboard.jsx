import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import ProviderStatusToggle from '../../components/provider/ProviderStatusToggle';
import IncomingJobToast from '../../components/common/IncomingJobToast';
import {
  Wrench,
  CheckCircle,
  Truck,
  PlayCircle,
  Clock,
  Phone,
  MapPin,
  IndianRupee,
  AlertCircle,
  Check,
  X,
  History,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [historyJobs, setHistoryJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [finalCostInput, setFinalCostInput] = useState('');
  const [error, setError] = useState('');
  const [incomingPopup, setIncomingPopup] = useState(null);

  const { subscribe } = useWebSocket();

  const fetchJobs = async () => {
    try {
      const [activeRes, availableRes, historyRes] = await Promise.all([
        api.get('/provider/jobs/active'),
        api.get('/provider/jobs/available'),
        api.get('/provider/jobs/history'),
      ]);

      if (activeRes.data?.success) setActiveJob(activeRes.data.data);
      if (availableRes.data?.success) setAvailableJobs(availableRes.data.data);
      if (historyRes.data?.success) setHistoryJobs(historyRes.data.data);
    } catch (err) {
      console.error('Failed to load provider jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Subscribe to direct provider incoming jobs via WebSocket
    let unsubUser = null;
    if (user?.id) {
      unsubUser = subscribe(`/topic/provider/${user.id}/jobs`, (job) => {
        setIncomingPopup(job);
        fetchJobs();
      });
    }

    const interval = setInterval(fetchJobs, 6000);
    return () => {
      if (unsubUser) unsubUser();
      clearInterval(interval);
    };
  }, [user?.id, subscribe]);

  const handleAcceptJob = async (jobId) => {
    setAcceptingId(jobId);
    setError('');
    try {
      const res = await api.post(`/provider/jobs/${jobId}/accept`);
      if (res.data?.success) {
        await fetchJobs();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept job. It may have already been taken.');
      fetchJobs();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!activeJob) return;
    setStatusUpdating(true);
    setError('');

    try {
      const payload = { status: nextStatus };
      if (nextStatus === 'COMPLETED' && finalCostInput) {
        payload.finalCost = Number(finalCostInput);
      }

      const res = await api.patch(`/provider/jobs/${activeJob.id}/status`, payload);
      if (res.data?.success) {
        await fetchJobs();
        setFinalCostInput('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Compute Total Earnings
  const totalEarnings = historyJobs
    .filter((j) => j.status === 'COMPLETED' || j.status === 'PAID')
    .reduce((sum, j) => sum + Number(j.finalCost || j.estimatedCost || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Provider Online/Offline Status Header */}
      <ProviderStatusToggle />

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: ACTIVE JOB */}
      {activeJob && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
            <div>
              <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-200 text-xs font-bold rounded-full border border-indigo-400/30">
                ACTIVE JOB IN PROGRESS
              </span>
              <h2 className="text-2xl font-black mt-2">
                {activeJob.category.name} Service ({activeJob.trackingNumber})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-200">Current Status:</span>
              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-lg uppercase">
                {activeJob.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer & Address Details */}
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Customer Details
              </h3>
              <div className="space-y-1.5 text-sm">
                <p className="font-bold text-white text-base">{activeJob.customer.fullName}</p>
                <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <a href={`tel:${activeJob.customer.phone}`} className="hover:underline">
                    {activeJob.customer.phone || 'Phone upon request'}
                  </a>
                </div>
                <div className="flex items-start gap-1.5 text-slate-300 text-xs pt-2">
                  <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {activeJob.address.street}, {activeJob.address.city} - {activeJob.address.postalCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Problem Description & Cost */}
            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  Issue Description
                </h3>
                <p className="text-xs text-slate-200 italic">
                  "{activeJob.description}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Base:</span>
                <span className="font-bold text-lg text-emerald-400">₹{activeJob.estimatedCost}</span>
              </div>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Follow safety protocols and verify customer requirements upon arrival.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activeJob.status === 'ACCEPTED' && (
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleUpdateStatus('ON_THE_WAY')}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Truck className="w-4 h-4" />
                  Mark On The Way
                </button>
              )}

              {activeJob.status === 'ON_THE_WAY' && (
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <PlayCircle className="w-4 h-4" />
                  Start Service (In Progress)
                </button>
              )}

              {activeJob.status === 'IN_PROGRESS' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    placeholder="Final Bill (₹)"
                    value={finalCostInput}
                    onChange={(e) => setFinalCostInput(e.target.value)}
                    className="w-28 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AVAILABLE NEARBY REQUESTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Nearby Service Requests
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {availableJobs.length} Live
            </span>
          </div>

          <button
            onClick={fetchJobs}
            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {availableJobs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              No matching requests right now
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Keep your status <strong>ONLINE</strong>. When customers in your area request a service, it pops up here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {job.trackingNumber}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {job.category.name}
                      </h4>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ₹{job.estimatedCost}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="truncate">{job.address.street}, {job.address.city}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={acceptingId === job.id || !!activeJob}
                    onClick={() => handleAcceptJob(job.id)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {acceptingId === job.id ? 'Accepting...' : 'Accept Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: EARNINGS & COMPLETED JOBS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Earnings</span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">₹{totalEarnings}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Completed Jobs</span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {historyJobs.filter((j) => j.status === 'COMPLETED' || j.status === 'PAID').length}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Provider Rating</span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">4.9 / 5.0</h4>
          </div>
        </div>
      </div>

      {/* Real-time WebSocket Incoming Job Alert Toast */}
      {incomingPopup && (
        <IncomingJobToast
          job={incomingPopup}
          onAccept={(id) => {
            handleAcceptJob(id);
            setIncomingPopup(null);
          }}
          onDismiss={() => setIncomingPopup(null)}
        />
      )}
    </div>
  );
}
