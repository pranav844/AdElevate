import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-navy text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center font-bold text-white text-xl shadow">
              A
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              AdEle<span className="text-coral">vate</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 font-medium text-sm text-slate-300">
            <Link to="/" className="hover:text-white transition">Featured Ads</Link>
            <a href="#categories" className="hover:text-white transition">Categories</a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
  <div className="flex items-center gap-3">

    {/* Vendor Dashboard Button */}
    {currentUser.role === 'VENDOR' && (
      <button
        onClick={() => navigate('/vendor/dashboard')}
        className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 transition border border-white/20 rounded-lg hover:border-white/50"
      >
        My Dashboard
      </button>
    )}

    {/* ✅ Admin Panel Button — Only visible to ADMIN */}
    {currentUser.role === 'ADMIN' && (
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="text-xs font-bold text-purple-300 hover:text-white px-3 py-1.5 transition border border-purple-400/40 rounded-lg hover:border-purple-300 bg-purple-900/40"
      >
        👑 Admin Panel
      </button>
    )}

    {/* User Badge (Clickable to open /profile) */}
    <button
      onClick={() => navigate('/profile')}
      className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/20 hover:border-white/30 transition cursor-pointer"
      title="View & Edit Profile"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
      <span>{currentUser.name || currentUser.fullName || currentUser.email}</span>
    </button>

                {/* Logout */}
                <button onClick={onLogout} className="text-xs text-slate-400 hover:text-white px-2 py-1 transition font-medium">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-white font-medium text-sm px-3 py-2 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-coral hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
