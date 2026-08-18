import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthModal({ initialMode = 'login', onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('CUSTOMER');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        // LOGIN CALL
        const response = await loginUser({ email, password });
        // Save user & token
        localStorage.setItem('adelevate_user', JSON.stringify(response));
        if (response.token) localStorage.setItem('adelevate_token', response.token);
        if (onAuthSuccess) onAuthSuccess(response);
      } else {
        // REGISTER CALL
        const registerPayload = {
          name,
          email,
          password,
          phoneNumber,
          role,
          status: 'ACTIVE',
          businessName: role === 'VENDOR' ? `${name}'s Shop` : '',
          businessCategory: role === 'VENDOR' ? 'Electronics' : '',
        };
        const response = await registerUser(registerPayload);
        
        // Auto login on successful register
        localStorage.setItem('adelevate_user', JSON.stringify(response));
        if (response.token) localStorage.setItem('adelevate_token', response.token);
        if (onAuthSuccess) onAuthSuccess(response);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-3 font-extrabold text-sm border-b-2 transition ${
              mode === 'login' ? 'border-coral text-coral' : 'border-transparent text-slate-400 hover:text-navy'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-3 font-extrabold text-sm border-b-2 transition ${
              mode === 'register' ? 'border-coral text-coral' : 'border-transparent text-slate-400 hover:text-navy'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 text-xs font-medium p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                required
                className="w-full bg-slate-50 text-charcoal px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-navy mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-slate-50 text-charcoal px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full bg-slate-50 text-charcoal px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="w-full bg-slate-50 text-charcoal px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 text-charcoal px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium cursor-pointer"
                >
                  <option value="CUSTOMER">Customer (Browse & Review)</option>
                  <option value="VENDOR">Business Vendor (Post Ads)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-coral hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-lg mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In 🚀' : 'Create Account 🚀'}
          </button>

        </form>

      </div>
    </div>
  );
}
