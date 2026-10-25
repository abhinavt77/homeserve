import React from 'react';
import { Wrench, Shield, Clock, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">HomeServe</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Reliable, on-demand home service professionals at your doorstep. Verified electricians, plumbers, and cleaners.
            </p>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>Electrician Repair & Wiring</li>
              <li>Plumbing & Leak Detection</li>
              <li>Deep House Cleaning</li>
              <li>Carpentry & Furniture Assembly</li>
              <li>Appliance Installation</li>
            </ul>
          </div>

          {/* Quick Features */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Features
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Verified Technicians
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Real-Time Tracking
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Customer Protection Guarantee
              </li>
            </ul>
          </div>

          {/* Demo Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              College Project Demo
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              Spring Boot 3 + React (Vite) + PostgreSQL/PostGIS + STOMP WebSocket + Razorpay test mode.
            </p>
            <div className="text-xs bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-mono">
              Admin: admin@homeserve.com<br />
              Pass: Admin@123
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} HomeServe Platform. Built with Spring Boot 3 & React. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
