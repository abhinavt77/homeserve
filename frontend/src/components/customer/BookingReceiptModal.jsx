import React, { useRef } from 'react';
import {
  Wrench,
  Printer,
  X,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Receipt,
  Download
} from 'lucide-react';

export default function BookingReceiptModal({ booking, onClose }) {
  const receiptRef = useRef(null);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const fare = Number(booking.finalCost || booking.estimatedCost || 299);
  const baseServiceFee = Math.round(fare * 0.75);
  const laborAndConsumables = Math.round(fare * 0.15);
  const taxesGst = Math.round(fare * 0.10);
  const totalAmount = baseServiceFee + laborAndConsumables + taxesGst;

  const bookingDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN');

  const invoiceNumber = `INV-${booking.trackingNumber || 'HS'}-${booking.id || '01'}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[95vh] overflow-y-auto print:p-0 print:border-none print:shadow-none print:max-h-none print:max-w-none print:overflow-visible">
        {/* Top Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Official Booking Receipt & Tax Invoice
              </h3>
              <p className="text-xs text-slate-400">HomeServe Technologies Pvt. Ltd.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div ref={receiptRef} className="space-y-6 text-slate-800 dark:text-slate-200 print:text-black">
          {/* Company Branding & Invoice Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white print:text-black">
                  HomeServe
                </span>
              </div>
              <p className="text-xs text-slate-500 print:text-slate-600 leading-relaxed">
                HomeServe Technologies Pvt. Ltd.<br />
                Indiranagar, Bangalore, Karnataka - 560038<br />
                GSTIN: 29AAACH7409R1ZZ • support@homeserve.com
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 print:border-slate-300">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] uppercase">
                {booking.status === 'PAID' ? 'PAID & SETTLED' : 'BOOKING CONFIRMED'}
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-white print:text-black pt-1">
                {invoiceNumber}
              </p>
              <p className="text-slate-400 print:text-slate-500">Date: {bookingDate}</p>
            </div>
          </div>

          {/* Two Columns: Customer Info & Service Dispatch Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 print:border-slate-300 space-y-1.5">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Customer Details
              </h4>
              <p className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
                {booking.customer?.fullName || 'Valued Customer'}
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-black flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{booking.customer?.email || 'N/A'}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-black flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{booking.customer?.phone || 'N/A'}</span>
              </p>
              <div className="pt-1 text-slate-600 dark:text-slate-300 print:text-black flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {booking.address?.street}, {booking.address?.city}, {booking.address?.state} - {booking.address?.postalCode}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 print:border-slate-300 space-y-1.5">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Service & Specialist Assigned
              </h4>
              <p className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
                {booking.category?.name || 'On-Demand Home Service'}
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-black">
                <b>Tracking Ref:</b> <span className="font-mono text-indigo-600 dark:text-indigo-400 print:text-black">{booking.trackingNumber}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300 print:text-black">
                <b>Assigned Specialist:</b> {booking.provider?.fullName || 'Assigned automatically via GPS dispatch'}
              </p>
              {booking.provider?.phone && (
                <p className="text-slate-600 dark:text-slate-300 print:text-black">
                  <b>Specialist Contact:</b> {booking.provider.phone}
                </p>
              )}
              <p className="text-slate-500 italic text-[11px] pt-1">
                "{booking.description}"
              </p>
            </div>
          </div>

          {/* Itemized Billing Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 print:border-slate-300 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 print:bg-slate-100 print:border-slate-300 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-center">Qty / Rate</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-200">
                <tr>
                  <td className="py-3 px-4 font-semibold">
                    {booking.category?.name} - Base Inspection & Diagnostics
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">1 Unit</td>
                  <td className="py-3 px-4 text-right font-semibold">₹{baseServiceFee}.00</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">
                    Certified Specialist Labor & Equipment Charges
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">1 Job</td>
                  <td className="py-3 px-4 text-right font-semibold">₹{laborAndConsumables}.00</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">
                    Service Tax & Regulatory GST (18%)
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">SGST+CGST</td>
                  <td className="py-3 px-4 text-right font-semibold">₹{taxesGst}.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-indigo-50/50 dark:bg-indigo-950/30 print:bg-slate-100 font-bold border-t border-slate-200 dark:border-slate-700">
                  <td colSpan={2} className="py-3.5 px-4 text-slate-900 dark:text-white print:text-black text-sm">
                    Total Amount Due / Settled
                  </td>
                  <td className="py-3.5 px-4 text-right text-base text-indigo-600 dark:text-indigo-400 print:text-black">
                    ₹{totalAmount}.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Guarantee & Terms */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 print:text-slate-500 space-y-1">
            <p className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Includes HomeServe 30-Day Service Guarantee & Verified Background Check</span>
            </p>
            <p>
              This is a computer-generated tax invoice. No signature is required. For customer support or grievance redressal, contact support@homeserve.com.
            </p>
          </div>
        </div>

        {/* Modal Close CTA */}
        <div className="pt-2 flex justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
