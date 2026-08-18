import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAds, approveAd, rejectAd } from '../services/api';

const STATUS_CONFIG = {
  APPROVED:         { label: 'Approved',         bg: 'bg-emerald-100', text: 'text-emerald-700' },
  ACTIVE:           { label: 'Active',            bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING_PAYMENT:  { label: 'Pending Payment',   bg: 'bg-amber-100',   text: 'text-amber-700'   },
  PENDING_APPROVAL: { label: 'Pending Approval',  bg: 'bg-blue-100',    text: 'text-blue-700'    },
  REJECTED:         { label: 'Rejected',          bg: 'bg-red-100',     text: 'text-red-700'     },
};

export default function AdminDashboardPage({ currentUser }) {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING_APPROVAL'); // 'PENDING_APPROVAL' | 'ALL' | 'APPROVED' | 'REJECTED'
  const [actionMessage, setActionMessage] = useState('');

  const getUser = () => {
    if (currentUser) return currentUser;
    const stored = localStorage.getItem('adelevate_user');
    return stored ? JSON.parse(stored) : null;
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate('/login'); return; }
    if (u.role !== 'ADMIN') { navigate('/'); return; }
    loadAllAds();
  }, [currentUser]);

  const loadAllAds = async () => {
    setLoading(true);
    try {
      const data = await getAds();
      setAds(data || []);
    } catch (err) {
      console.error('Failed to load ads for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId) => {
    setActionMessage(`Approving Ad #${adId}...`);
    try {
      await approveAd(adId);
      setActionMessage(`✅ Ad #${adId} successfully Approved!`);
      // Update local state
      setAds((prev) =>
        prev.map((a) => (a.adId === adId ? { ...a, status: 'APPROVED' } : a))
      );
    } catch (err) {
      setActionMessage(`❌ Approval Error: ${err.message}`);
    }
  };

  const handleReject = async (adId) => {
    setActionMessage(`Rejecting Ad #${adId}...`);
    try {
      await rejectAd(adId);
      setActionMessage(`🚫 Ad #${adId} Rejected.`);
      // Update local state
      setAds((prev) =>
        prev.map((a) => (a.adId === adId ? { ...a, status: 'REJECTED' } : a))
      );
    } catch (err) {
      setActionMessage(`❌ Rejection Error: ${err.message}`);
    }
  };

  // Stats computation
  const stats = {
    pendingApproval: ads.filter((a) => a.status === 'PENDING_APPROVAL').length,
    approved: ads.filter((a) => a.status === 'APPROVED' || a.status === 'ACTIVE').length,
    rejected: ads.filter((a) => a.status === 'REJECTED').length,
    total: ads.length,
  };

  // Filter ads according to active tab
  const filteredAds = ads.filter((a) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'APPROVED') return a.status === 'APPROVED' || a.status === 'ACTIVE';
    return a.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-misty">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-purple-600 font-bold text-xs uppercase tracking-wider">Super Admin Portal</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">Ad Moderation & Approvals</h1>
            <p className="text-slate-500 text-xs mt-1">Review vendor submitted ads and manage platform moderation.</p>
          </div>
          <button
            onClick={loadAllAds}
            className="px-4 py-2 bg-navy text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
          >
            ↻ Refresh Ads List
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 shadow-sm">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Pending Approval</p>
            <p className="text-3xl font-extrabold text-blue-700">{stats.pendingApproval}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Approved & Active</p>
            <p className="text-3xl font-extrabold text-emerald-700">{stats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-5 border border-red-200 shadow-sm">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Rejected Ads</p>
            <p className="text-3xl font-extrabold text-red-700">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Ads System-Wide</p>
            <p className="text-3xl font-extrabold text-navy">{stats.total}</p>
          </div>
        </div>

        {/* Action Status Toast */}
        {actionMessage && (
          <div className="mb-6 p-4 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex justify-between items-center">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="text-purple-400 hover:text-purple-900">✕</button>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Tab Controls */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-4 gap-4 text-xs font-bold">
            {[
              { id: 'PENDING_APPROVAL', label: `Pending Approval (${stats.pendingApproval})` },
              { id: 'APPROVED', label: `Approved (${stats.approved})` },
              { id: 'REJECTED', label: `Rejected (${stats.rejected})` },
              { id: 'ALL', label: `All Ads (${stats.total})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-coral text-coral font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading advertisements for review...</div>
          ) : filteredAds.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-navy text-lg mb-1">No Ads in this tab</h3>
              <p className="text-slate-500 text-xs">There are no advertisements matching status "{activeTab}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Ad Listing</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Plan</th>
                    <th className="px-6 py-3 text-left">Price Range</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAds.map((ad) => {
                    const statusCfg = STATUS_CONFIG[ad.status] || STATUS_CONFIG.REJECTED;
                    return (
                      <tr key={ad.adId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 max-w-xs">
                            <img
                              src={ad.productImage || 'https://picsum.photos/40/40'}
                              alt={ad.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="font-bold text-navy text-xs truncate">{ad.title}</p>
                              <p className="text-slate-400 text-[10px] truncate">Ad #{ad.adId} • Vendor #{ad.vendorId || 1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {ad.category?.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {ad.planType || 'STANDARD'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-sapphire">
                          {ad.priceRange || `₹${ad.minPrice}–₹${ad.maxPrice}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ad.status !== 'APPROVED' && ad.status !== 'ACTIVE' && (
                              <button
                                onClick={() => handleApprove(ad.adId)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-sm"
                              >
                                Approve ✅
                              </button>
                            )}
                            {ad.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleReject(ad.adId)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[11px] rounded-lg transition shadow-sm"
                              >
                                Reject ❌
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
