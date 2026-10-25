import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Zap,
  Droplet,
  Sparkles,
  Hammer,
  Tv,
  ShieldCheck,
  Clock,
  Star,
  CheckCircle,
  MapPin,
  ArrowRight,
  Award,
  Users
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, role } = useAuth();

  const services = [
    {
      id: 1,
      title: 'Electrical Services',
      description: 'Wiring repair, appliance installation, fuse box upgrades, and short-circuit troubleshooting.',
      icon: Zap,
      color: 'from-amber-500 to-yellow-400',
      price: 'From ₹299',
    },
    {
      id: 2,
      title: 'Plumbing Works',
      description: 'Leak fixes, pipe blockage removal, tap & faucet repair, water heater connections.',
      icon: Droplet,
      color: 'from-sky-500 to-blue-400',
      price: 'From ₹249',
    },
    {
      id: 3,
      title: 'Deep House Cleaning',
      description: 'Complete home sanitization, kitchen chimney cleaning, sofa shampooing, bathroom disinfection.',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-400',
      price: 'From ₹399',
    },
    {
      id: 4,
      title: 'Carpentry & Woodwork',
      description: 'Furniture assembly, hinge and drawer fixing, custom shelves, and wooden door alignment.',
      icon: Hammer,
      color: 'from-orange-500 to-amber-400',
      price: 'From ₹349',
    },
    {
      id: 5,
      title: 'Appliance Repair',
      description: 'AC servicing, refrigerator cooling fixes, washing machine repair, microwave diagnosis.',
      icon: Tv,
      color: 'from-purple-500 to-indigo-400',
      price: 'From ₹449',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Pick Service & Location',
      desc: 'Select from certified electricians, plumbers, or cleaners and pin your exact address on our interactive map.',
    },
    {
      step: '02',
      title: 'Instant Provider Match',
      desc: 'Our geospatial engine instantly alerts online, verified technicians within 15 km in real-time via WebSocket.',
    },
    {
      step: '03',
      title: 'Track & Pay Securely',
      desc: 'Track technician status live: ON_THE_WAY → IN_PROGRESS → COMPLETED. Pay via Razorpay or Cash upon completion.',
    },
  ];

  const testimonials = [
    {
      name: 'Ananya Sharma',
      role: 'Homeowner, Bangalore',
      comment: 'An electrician arrived within 25 minutes of booking! Fixed our circuit breaker immediately. Excellent tracking experience.',
      rating: 5,
    },
    {
      name: 'Vikram Mehta',
      role: 'Apartment Owner, Indiranagar',
      comment: 'The plumber was courteous, professional, and had all genuine spare parts. Razorpay checkout made payment smooth.',
      rating: 5,
    },
    {
      name: 'Rohan Gupta',
      role: 'Service Provider (Electrician)',
      comment: 'As a verified technician, I receive direct nearby requests on my phone with zero delays. Great platform to grow my business.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-Time On-Demand Service Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Fast, Verified Home Services{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  At Your Doorstep.
                </span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Need an emergency electrician or trusted plumber right now? Pin your address and nearby verified professionals accept your request live in real-time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to={isAuthenticated ? (role === 'PROVIDER' ? '/provider' : '/customer') : '/register'}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-base"
                >
                  <span>Book a Service Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/register"
                  className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 text-base"
                >
                  <span>Join as Technician</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">100% Verified Providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Fast 15-30 Min Arrival</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">4.9/5 Service Rating</span>
                </div>
              </div>
            </div>

            {/* Visual Hero Mockup */}
            <div className="relative">
              <div className="w-full aspect-square max-w-lg mx-auto bg-gradient-to-br from-indigo-100 via-indigo-50 to-slate-100 dark:from-indigo-950/40 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Live Dispatch Radar</span>
                </div>

                {/* Radar Mockup Card */}
                <div className="space-y-3 my-auto">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Emergency Electrician Request</h4>
                        <p className="text-xs text-slate-500">Koramangala, Bangalore • 2.4 km away</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-full animate-pulse">
                      Matching Live
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
                        <Droplet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Water Leak Repair</h4>
                        <p className="text-xs text-slate-500">Indiranagar • Accepted by Amit V. (4.9★)</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold rounded-full">
                      ON THE WAY
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-600/10 rounded-xl text-center text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  ⚡ WebSocket Powered • Zero-Latency STOMP Updates
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Service Catalog
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Specialized Experts For Every Need
          </h3>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transparent pricing, skilled and verified technicians, backed by our customer guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {s.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {s.price}
                  </span>
                  <Link
                    to="/customer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Book Now →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-100/60 dark:bg-slate-900/60 py-20 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
              Simple 3-Step Process
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How HomeServe Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st) => (
              <div key={st.step} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <span className="text-6xl font-black text-slate-100 dark:text-slate-700 absolute -top-2 right-4 pointer-events-none">
                  {st.step}
                </span>
                <div className="relative z-10 space-y-3">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{st.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Testimonials
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Loved By Customers & Pros Alike
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{t.comment}"
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h5>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <h3 className="text-3xl md:text-4xl font-black mb-4">
            Ready for Hassle-Free Home Repairs?
          </h3>
          <p className="text-indigo-100 text-base max-w-xl mx-auto mb-8">
            Create an account in seconds. Book verified electricians, plumbers, and home cleaners instantly.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
