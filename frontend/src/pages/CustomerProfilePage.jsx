import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/api';

export default function CustomerProfilePage({ currentUser, onProfileUpdated }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const getUser = () => {
    if (currentUser) return currentUser;
    const stored = localStorage.getItem('adelevate_user');
    return stored ? JSON.parse(stored) : null;
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate('/login'); return; }
    loadProfile(u);
  }, [currentUser]);

  const loadProfile = async (userObj) => {
    const userId = userObj?.userId || userObj?.id;
    if (!userId) {
      // Fallback to local session data
      setName(userObj?.name || '');
      setEmail(userObj?.email || '');
      setPhoneNumber(userObj?.phoneNumber || '');
      setRole(userObj?.role || 'CUSTOMER');
      setStatus(userObj?.status || 'ACTIVE');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getUserProfile(userId);
      setName(data.name || '');
      setEmail(data.email || '');
      setPhoneNumber(data.phoneNumber || '');
      setRole(data.role || 'CUSTOMER');
      setStatus(data.status || 'ACTIVE');
    } catch (err) {
      console.error('Failed to load profile:', err);
      // Fallback to local session state
      setName(userObj?.name || '');
      setEmail(userObj?.email || '');
      setPhoneNumber(userObj?.phoneNumber || '');
      setRole(userObj?.role || 'CUSTOMER');
      setStatus(userObj?.status || 'ACTIVE');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Full name is required.' });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
      setMessage({ type: 'error', text: 'Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9.' });
      return;
    }

    const token = localStorage.getItem('adelevate_token');
    if (!token) {
      setMessage({ type: 'error', text: 'Session token missing. Please logout and login again to refresh your security token.' });
      return;
    }

    const u = getUser();
    const userId = u?.userId || u?.id;

    if (!userId) {
      setMessage({ type: 'error', text: 'User ID missing in session. Please logout and login again to refresh your account session.' });
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        fullName: name.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      let updatedUser = null;
      if (userId) {
        updatedUser = await updateUserProfile(userId, updateData);
      }

      // Update local storage session
      const stored = localStorage.getItem('adelevate_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const newSession = { ...parsed, name: name.trim(), phoneNumber: phoneNumber.trim() };
        localStorage.setItem('adelevate_user', JSON.stringify(newSession));
        if (onProfileUpdated) onProfileUpdated(newSession);
      }

      setMessage({ type: 'success', text: '🎉 Profile details updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-misty py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          {/* Header Badge */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-coral/10 text-coral font-extrabold text-2xl flex items-center justify-center border border-coral/20 uppercase">
              {name ? name[0] : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-navy">{name || 'User Profile'}</h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 uppercase">
                  {role}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">{email}</p>
            </div>
          </div>

          {/* Status Toast */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-bold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading your profile details...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Email Address (Read Only)</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-100 px-4 py-2.5 rounded-xl text-xs border border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Phone Number (10-digits) *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  maxLength="10"
                  className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Account Role</label>
                  <input
                    type="text"
                    value={role}
                    disabled
                    className="w-full bg-slate-100 px-4 py-2.5 rounded-xl text-xs border border-slate-200 text-slate-500 font-medium cursor-not-allowed uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Account Status</label>
                  <input
                    type="text"
                    value={status}
                    disabled
                    className="w-full bg-slate-100 px-4 py-2.5 rounded-xl text-xs border border-slate-200 text-emerald-600 font-bold cursor-not-allowed uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-coral hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-lg disabled:opacity-50 mt-4"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes 💾'}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
