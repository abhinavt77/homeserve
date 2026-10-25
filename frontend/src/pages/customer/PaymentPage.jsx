import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import BookingReceiptModal from '../../components/customer/BookingReceiptModal';
import {
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Star,
  Wrench,
  Clock
} from 'lucide-react';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('RAZORPAY'); // 'RAZORPAY' or 'CASH'
  const [processing, setProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await api.get(`/customer/bookings/${bookingId}`);
        if (res.data?.success) {
          setBooking(res.data.data);
          if (res.data.data.status === 'PAID') {
            setPaidSuccess(true);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleRazorpayCheckout = async () => {
    setProcessing(true);
    setError('');

    try {
      // 1. Create Order on backend
      const res = await api.post(`/customer/payments/create-order/${bookingId}`);
      if (!res.data?.success) {
        throw new Error('Failed to create payment order');
      }

      const orderData = res.data.data;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: Math.round(Number(orderData.amount) * 100),
        currency: orderData.currency || 'INR',
        name: 'HomeServe Platform',
        description: `Payment for ${orderData.trackingNumber}`,
        order_id: orderData.orderId.startsWith('order_test_') ? undefined : orderData.orderId,
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone,
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async function (response) {
          // 3. Verify signature on backend
          try {
            const verifyPayload = {
              razorpayOrderId: response.razorpay_order_id || orderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpaySignature: response.razorpay_signature || 'test_signature_valid',
            };

            const verifyRes = await api.post(`/customer/payments/verify/${bookingId}`, verifyPayload);
            if (verifyRes.data?.success) {
              setPaidSuccess(true);
            }
          } catch (verErr) {
            setError(verErr.response?.data?.message || 'Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setError(response.error.description || 'Payment failed');
          setProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback simulated payment in test environment
        const simulatedPaymentId = 'pay_simulated_' + Math.random().toString(36).substring(2, 10);
        const verifyRes = await api.post(`/customer/payments/verify/${bookingId}`, {
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: simulatedPaymentId,
          razorpaySignature: 'simulated_signature',
        });
        if (verifyRes.data?.success) {
          setPaidSuccess(true);
        }
        setProcessing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment gateway initialization failed');
      setProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const res = await api.post(`/customer/payments/cash/${bookingId}`);
      if (res.data?.success) {
        setPaidSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to settle with cash');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Invoice</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link to="/customer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const finalAmount = booking.finalCost || booking.estimatedCost;

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
          <Receipt className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Invoice & Payment Settlement
        </h1>
        <p className="text-xs text-slate-500">
          Booking Ref: <span className="font-mono font-semibold">{booking.trackingNumber}</span>
        </p>
      </div>

      {paidSuccess ? (
        /* Payment Success Screen */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Payment Successful!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ₹{finalAmount} settled via {method === 'RAZORPAY' ? 'Razorpay Secure Checkout' : 'Cash on Delivery'}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 text-xs space-y-2 border border-slate-200 dark:border-slate-700 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{booking.category.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Technician:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{booking.provider?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">PAID & SETTLED</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>View Tax Receipt</span>
            </button>

            <Link
              to={`/customer/review/${booking.id}`}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Rate & Review Technician</span>
            </Link>

            <Link
              to="/customer"
              className="py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center"
            >
              Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Payment Selection Screen */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Invoice Summary Box */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Service Category:</span>
              <span className="font-bold text-slate-900 dark:text-white">{booking.category.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Verified Specialist:</span>
              <span className="font-bold text-slate-900 dark:text-white">{booking.provider?.fullName || 'Assigned Pro'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Problem Description:</span>
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{booking.description}</span>
            </div>
            <div className="pt-2 border-t border-indigo-200 dark:border-indigo-900 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount Due:</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{finalAmount}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Choose Payment Method
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Razorpay Option */}
              <div
                onClick={() => setMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                  method === 'RAZORPAY'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Razorpay Online</h4>
                  <p className="text-[10px] text-slate-400">UPI, Cards, NetBanking</p>
                </div>
              </div>

              {/* Cash Option */}
              <div
                onClick={() => setMethod('CASH')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                  method === 'CASH'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Cash Payment</h4>
                  <p className="text-[10px] text-slate-400">Pay directly to technician</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            disabled={processing}
            onClick={method === 'RAZORPAY' ? handleRazorpayCheckout : handleCashPayment}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>
                  {method === 'RAZORPAY' ? `Pay ₹${finalAmount} Online with Razorpay` : `Confirm Cash Payment of ₹${finalAmount}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            256-Bit Encrypted Secure Checkout • Test Mode Enabled
          </p>
        </div>
      )}
      {/* Tax Invoice Receipt Modal */}
      {showReceiptModal && (
        <BookingReceiptModal
          booking={booking}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
