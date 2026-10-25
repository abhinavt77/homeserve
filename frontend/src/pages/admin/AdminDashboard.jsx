import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Users,
  Wrench,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  Tag,
  Clock,
  Layers,
  Check,
  X,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'providers', 'bookings', 'categories', 'complaints', 'payments'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Dashboard Data
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);

  // Filter & Search states
  const [providerFilter, setProviderFilter] = useState('ALL'); // 'ALL', 'PENDING', 'VERIFIED'
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Complaint Resolution Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // New Category Form Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catBasePrice, setCatBasePrice] = useState(299);
  const [catHourlyRate, setCatHourlyRate] = useState(199);
  const [savingCat, setSavingCat] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await api.get('/admin/providers');
      if (res.data?.success) setProviders(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      if (res.data?.success) setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints');
      if (res.data?.success) setComplaints(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      if (res.data?.success) setPayments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAll = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      await Promise.allSettled([
        fetchStats(),
        fetchProviders(),
        fetchBookings(),
        fetchCategories(),
        fetchComplaints(),
        fetchPayments()
      ]);
    } catch (err) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleVerifyProvider = async (providerId, approved) => {
    try {
      const res = await api.patch(`/admin/providers/${providerId}/verify?approved=${approved}`);
      if (res.data?.success) {
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, verified: approved } : p))
        );
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setResolving(true);

    try {
      const res = await api.patch(`/admin/complaints/${selectedComplaint.id}`, {
        status: resolutionStatus,
        resolutionNotes: resolutionNotes.trim(),
      });
      if (res.data?.success) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === selectedComplaint.id ? res.data.data : c))
        );
        setSelectedComplaint(null);
        setResolutionNotes('');
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setResolving(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName || !catCode) return;
    setSavingCat(true);

    try {
      const res = await api.post('/categories', {
        name: catName.trim(),
        code: catCode.trim().toUpperCase(),
        description: catDesc.trim(),
        basePrice: parseFloat(catBasePrice),
        hourlyRate: parseFloat(catHourlyRate),
        iconName: 'Wrench',
        active: true,
      });
      if (res.data?.success) {
        setCategories((prev) => [...prev, res.data.data]);
        setShowCatModal(false);
        setCatName('');
        setCatCode('');
        setCatDesc('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSavingCat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filtered lists
  const filteredProviders = providers.filter((p) => {
    if (providerFilter === 'PENDING') return !p.verified;
    if (providerFilter === 'VERIFIED') return p.verified;
    return true;
  });

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== 'ALL' && b.status !== bookingFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        b.trackingNumber.toLowerCase().includes(term) ||
        b.customer?.fullName?.toLowerCase().includes(term) ||
        b.category?.name?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-black tracking-wider uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">Platform Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            System Administration & Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { key: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
          { key: 'providers', label: `Technicians (${providers.length})`, icon: Wrench, badge: stats?.pendingVerifications },
          { key: 'bookings', label: `Bookings (${bookings.length})`, icon: Layers },
          { key: 'categories', label: `Service Categories (${categories.length})`, icon: Tag },
          { key: 'complaints', label: `Disputes (${complaints.length})`, icon: ShieldAlert, badge: stats?.openComplaints },
          { key: 'payments', label: `Revenue & Ledger (${payments.length})`, icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Total Settled Revenue</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{Number(stats.totalRevenue).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3 h-3" />
                <span>100% Real-time settled</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Total Service Bookings</span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalBookings}
              </p>
              <p className="text-[11px] text-slate-400">
                {stats.completedBookings} Completed • {stats.inProgressBookings} Active
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Registered Providers</span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalProviders}
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {stats.pendingVerifications} Pending Verification
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Platform Users</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalCustomers} Customers
              </p>
              <p className="text-[11px] text-slate-400">
                {stats.openComplaints} Open Disputes
              </p>
            </div>
          </div>

          {/* Category Revenue Breakdown & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Performance */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Revenue & Demand by Service Category</span>
                <span className="text-xs font-normal text-slate-400">Live Totals</span>
              </h3>

              <div className="space-y-4">
                {stats.categoryStats?.map((cat) => {
                  const maxBooking = Math.max(...stats.categoryStats.map((c) => c.bookingCount), 1);
                  const pct = Math.round((cat.bookingCount / maxBooking) * 100);
                  return (
                    <div key={cat.categoryCode} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {cat.categoryName}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{cat.bookingCount} jobs</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            ₹{Number(cat.totalRevenue || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Breakdown Box */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Booking Status Distribution
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Completed & Paid</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400">{stats.completedBookings}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">In Progress / Active</span>
                  <span className="font-black text-blue-700 dark:text-blue-400">{stats.inProgressBookings}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending Dispatch</span>
                  <span className="font-black text-amber-700 dark:text-amber-400">{stats.pendingBookings}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Cancelled / Expired</span>
                  <span className="font-black text-rose-700 dark:text-rose-400">{stats.cancelledBookings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Feed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Service Requests
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Tracking</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Provider</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {stats.recentBookings?.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {b.trackingNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                        {b.customer?.fullName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {b.category?.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {b.provider?.fullName || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        ₹{b.finalCost || b.estimatedCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVIDERS & VERIFICATION */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              {['ALL', 'PENDING', 'VERIFIED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setProviderFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    providerFilter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {p.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">{p.email} • {p.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {p.categoryName}
                      </td>
                      <td className="py-3 px-4">
                        {p.experienceYears} Years
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-500">
                        ★ {p.averageRating} ({p.totalReviews})
                      </td>
                      <td className="py-3 px-4">
                        {p.documentUrl ? (
                          <a
                            href={p.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Cert</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.verified ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                            PENDING REVIEW
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.verified ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyProvider(p.id, false)}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleVerifyProvider(p.id, true)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracking, customer, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setBookingFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                    bookingFilter === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Tracking</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {b.trackingNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {b.category?.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{b.customer?.fullName}</div>
                        <div className="text-[11px] text-slate-400">{b.customer?.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        {b.provider?.fullName || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4 max-w-[150px] truncate">
                        {b.address?.street}, {b.address?.city}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        ₹{b.finalCost || b.estimatedCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE CATEGORIES & PRICING */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage platform offerings, initial dispatch cost, and technician hourly billing rates.
            </p>
            <button
              type="button"
              onClick={() => setShowCatModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>Add New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {cat.code}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Base Fare</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{cat.basePrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Hourly Rate</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{cat.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPLAINTS & DISPUTE RESOLUTION */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-500">
            Customer and technician disputes logged across active and completed bookings.
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Complainant</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        #{c.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{c.userName}</div>
                        <div className="text-[11px] text-slate-400">{c.userEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {c.subject}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                        {c.requestTrackingNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.status === 'DISMISSED'
                            ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setResolutionStatus(c.status === 'OPEN' ? 'RESOLVED' : c.status);
                            setResolutionNotes(c.resolutionNotes || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REVENUE & LEDGER */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <p className="text-xs text-slate-500">
            Real-time ledger of all payments processed via Razorpay and verified Cash Settlements.
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Razorpay Order ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Paid Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {payments.map((pm) => (
                    <tr key={pm.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                        TXN-{pm.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                        {pm.trackingNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {pm.paymentMethod}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        ₹{pm.amount}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {pm.razorpayOrderId || 'N/A (Cash)'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pm.paymentStatus === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {pm.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {pm.paidAt ? new Date(pm.paidAt).toLocaleString() : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE COMPLAINT MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Resolve Complaint Ticket #{selectedComplaint.id}
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 text-xs">
              <p><b>User:</b> {selectedComplaint.userName} ({selectedComplaint.userEmail})</p>
              <p><b>Subject:</b> {selectedComplaint.subject}</p>
              <p><b>Description:</b> {selectedComplaint.description}</p>
            </div>

            <form onSubmit={handleResolveComplaint} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Update Ticket Status
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                >
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resolution Notes / Action Taken
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain resolution (e.g. refund issued, technician counseled, customer satisfied)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {resolving ? 'Updating...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Service Category
              </h3>
              <button
                onClick={() => setShowCatModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carpenter, Painter, AC Repair"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CARPENTER, PAINTER"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Base Fare (₹)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={catBasePrice}
                    onChange={(e) => setCatBasePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={catHourlyRate}
                    onChange={(e) => setCatHourlyRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief description of the service scope..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {savingCat ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
