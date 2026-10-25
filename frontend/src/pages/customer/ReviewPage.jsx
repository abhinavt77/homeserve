import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Star,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Wrench,
  MessageSquare,
  ShieldAlert,
  Send
} from 'lucide-react';

export default function ReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Dispute / Complaint modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, reviewRes] = await Promise.allSettled([
          api.get(`/customer/bookings/${bookingId}`),
          api.get(`/customer/reviews/booking/${bookingId}`)
        ]);

        if (bookingRes.status === 'fulfilled' && bookingRes.value.data?.success) {
          setBooking(bookingRes.value.data.data);
        }

        if (reviewRes.status === 'fulfilled' && reviewRes.value.data?.data) {
          setExistingReview(reviewRes.value.data.data);
          setRating(reviewRes.value.data.data.rating);
          setComment(reviewRes.value.data.data.comment || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/customer/reviews/${bookingId}`, {
        rating,
        comment: comment.trim(),
      });
      if (res.data?.success) {
        setExistingReview(res.data.data);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!disputeSubject.trim() || !disputeDesc.trim()) {
      return;
    }

    setDisputeSubmitting(true);
    try {
      const res = await api.post('/customer/complaints', {
        requestId: bookingId,
        subject: disputeSubject.trim(),
        description: disputeDesc.trim(),
      });
      if (res.data?.success) {
        setDisputeSuccess(true);
        setTimeout(() => {
          setShowDisputeModal(false);
          setDisputeSuccess(false);
          setDisputeSubject('');
          setDisputeDesc('');
        }, 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setDisputeSubmitting(false);
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Unavailable</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link to="/customer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const providerName = booking?.provider?.fullName || 'Technician';

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/customer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>
      </div>

      {/* Main Review Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <Star className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {existingReview ? 'Your Service Review' : 'Rate Your Technician'}
          </h1>
          <p className="text-xs text-slate-500">
            Booking #{booking?.trackingNumber} • {booking?.category?.name}
          </p>
        </div>

        {/* Technician Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow">
            {providerName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {providerName}
            </h3>
            <p className="text-xs text-slate-500">
              {booking?.category?.name} Specialist
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
              {booking?.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success || existingReview ? (
          /* Already Reviewed Screen */
          <div className="space-y-6 text-center pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= (existingReview?.rating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                You gave {existingReview?.rating || rating} Stars!
              </p>
              {existingReview?.comment && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{existingReview.comment}"
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/customer"
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center"
              >
                Back to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setShowDisputeModal(true)}
                className="py-3 px-4 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Report Issue / File Complaint</span>
              </button>
            </div>
          </div>
        ) : (
          /* Review Form */
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Interactive Star Picker */}
            <div className="text-center space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Overall Experience Rating
              </label>
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          active
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {rating === 5 && 'Outstanding • Highly Recommended!'}
                {rating === 4 && 'Very Good • Satisfied with service'}
                {rating === 3 && 'Average • Met basic expectations'}
                {rating === 2 && 'Below Average • Needs improvement'}
                {rating === 1 && 'Poor Experience'}
              </p>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Written Feedback (Optional)</span>
                <span className="text-[10px] text-slate-400">{comment.length}/1000</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="Share your experience: punctuality, quality of work, cleanliness, professional etiquette..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Star Rating & Review</span>
                </>
              )}
            </button>

            {/* Complaint Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowDisputeModal(true)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Had a serious problem? File an administrative complaint</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Complaint / Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                File Complaint / Dispute
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {disputeSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">Ticket Created</h4>
                <p className="text-xs text-slate-500">
                  Our administrative dispute team will review your case.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFileDispute} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={disputeSubject}
                    onChange={(e) => setDisputeSubject(e.target.value)}
                    placeholder="e.g. Incomplete work, Overcharging, Damage"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={disputeDesc}
                    onChange={(e) => setDisputeDesc(e.target.value)}
                    placeholder="Describe what occurred with as much detail as possible..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disputeSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5"
                  >
                    {disputeSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
