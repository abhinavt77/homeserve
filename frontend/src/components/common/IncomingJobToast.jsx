import React, { useEffect } from 'react';
import { Zap, MapPin, X, ArrowRight, BellRing } from 'lucide-react';

// Play a pleasant notification chime using browser Web Audio API
function playAlertChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    // Audio autoplay restrictions might silence this without user interaction
  }
}

export default function IncomingJobToast({ job, onAccept, onDismiss }) {
  if (!job) return null;

  useEffect(() => {
    playAlertChime();
  }, [job]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-indigo-500 animate-bounce-short">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
            <BellRing className="w-5 h-5 animate-wiggle" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              New Nearby Request
            </span>
            <h4 className="font-extrabold text-base text-white">
              {job.category?.name || 'Service'} Job Available
            </h4>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="py-3 space-y-2 text-xs text-slate-300">
        <p className="italic text-slate-200 line-clamp-2">
          "{job.description}"
        </p>
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span className="truncate">
            {job.address?.street}, {job.address?.city}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 font-bold">
          <span className="text-emerald-400 text-sm">₹{job.estimatedCost}</span>
          <span className="text-slate-400 text-[10px]">First to accept wins</span>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={onDismiss}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-700"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept(job.id)}
          className="flex-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
        >
          <span>Accept Job</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
