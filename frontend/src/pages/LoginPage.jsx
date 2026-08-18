import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

export default function LoginPage({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Basic Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({ email, password });
      localStorage.setItem('adelevate_user', JSON.stringify(response));
      if (response.token) localStorage.setItem('adelevate_token', response.token);
      if (onAuthSuccess) onAuthSuccess(response);
      navigate('/'); // Redirect to home after login
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-misty p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100">

        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="text-coral font-bold text-xs uppercase tracking-wider hover:underline">
            ← Back to AdElevate
          </Link>
          <h2 className="text-2xl font-extrabold text-navy mt-2">Welcome Back 👋</h2>
          <p className="text-slate-500 text-xs mt-1">Sign in to your account to continue</p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 text-xs font-medium p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="you@example.com"
              className="w-full bg-slate-50 text-charcoal px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="Minimum 6 characters"
              className="w-full bg-slate-50 text-charcoal px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-coral hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In 🚀'}
          </button>
        </form>

        {/* Switch to Register */}
        <p className="text-center text-xs text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-coral font-bold hover:underline">
            Create Account →
          </Link>
        </p>
      </div>
    </div>
  );
}
