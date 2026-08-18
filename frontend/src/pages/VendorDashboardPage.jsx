import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdsByVendor } from '../services/api';
import CreateAdModal from '../components/CreateAdModal';
import RazorpayModal from '../components/RazorpayModal';

const STATUS_CONFIG = {
  APPROVED:        { label: 'Approved',         bg: 'bg-emerald-100', text: 'text-emerald-700' },
  ACTIVE:          { label: 'Active',            bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING_PAYMENT: { label: 'Pending Payment',   bg: 'bg-amber-100',   text: 'text-amber-700'   },
  PENDING_APPROVAL:{ label: 'Pending Approval',  bg: 'bg-blue-100',    text: 'text-blue-700'    },
  REJECTED:        { label: 'Rejected',          bg: 'bg-red-100',     text: 'text-red-700'     },
  EXPIRED:         { label: 'Expired',           bg: 'bg-slate-100',   text: 'text-slate-500'   },
};

export default function VendorDashboardPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [payingAd, setPayingAd] = useState(null);

  // Safe helper to get logged-in user
  const getUser = () => {
    if (currentUser) return currentUser;
    const stored = localStorage.getItem('adelevate_user');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return null;
  };

  const activeUser = getUser();

  // Redirect if not logged in or not a VENDOR
  useEffect(() => {
    const userObj = getUser();
    if (!userObj) { navigate('/login'); return; }
    if (userObj.role !== 'VENDOR') { navigate('/'); return; }
    loadAds(userObj);
  }, [currentUser]);

  const loadAds = async (overrideUser) => {
    const user = overrideUser || getUser();
    const vendorId = user?.userId || user?.vendorId;
    if (!vendorId) {
      setAds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getAdsByVendor(vendorId);
      setAds(data || []);
    } catch (err) {
      console.error('Failed to load vendor ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdCreated = (newAd) => {
    setAds((prev) => [newAd, ...prev]);
    // If PENDING_PAYMENT, open Razorpay modal immediately
    if (newAd?.status === 'PENDING_PAYMENT') {
      setPayingAd(newAd);
    }
  };

  const handlePaymentCompleted = () => {
    if (payingAd) {
      // Optimistically update status in local state
      setAds((prev) =>
        prev.map((a) =>
          a.adId === payingAd.adId ? { ...a, status: 'PENDING_APPROVAL' } : a
        )
      );
    }
    setPayingAd(null);
    loadAds();
  };

  // Stats computed from ads
  const stats = {
    total: ads.length,
    active: ads.filter(a => a.status === 'APPROVED' || a.status === 'ACTIVE').length,
    pendingPayment: ads.filter(a => a.status === 'PENDING_PAYMENT').length,
    pendingApproval: ads.filter(a => a.status === 'PENDING_APPROVAL').length,
  };

  return (
    <div className="min-h-screen bg-misty">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-coral font-bold text-xs uppercase tracking-wider">Vendor Portal</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Welcome, {currentUser?.name || 'Vendor'} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">{currentUser?.email}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-coral hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-lg"
          >
            + Post New Ad
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Ads', value: stats.total, color: 'text-navy', bg: 'bg-white' },
            { label: 'Active Ads', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Payment', value: stats.pendingPayment, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Pending Approval', value: stats.pendingApproval, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-slate-200 shadow-sm`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Ads Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-navy text-lg">Your Advertisements</h2>
            <button onClick={loadAds} className="text-xs text-coral font-bold hover:underline">↻ Refresh</button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading your ads...</div>
          ) : ads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📢</div>
              <h3 className="font-bold text-navy text-lg mb-1">No Ads Yet!</h3>
              <p className="text-slate-500 text-sm mb-4">Post your first advertisement to reach thousands of customers.</p>
              <button onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-coral text-white font-bold text-xs rounded-xl hover:bg-red-500 transition shadow"
              >
                + Post First Ad
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Ad Title</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Plan</th>
                    <th className="px-6 py-3 text-left">Price Range</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ads.map((ad) => {
                    const statusCfg = STATUS_CONFIG[ad.status] || STATUS_CONFIG.EXPIRED;
                    return (
                      <tr key={ad.adId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={ad.productImage || 'https://picsum.photos/40/40'}
                              alt={ad.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-navy text-xs">{ad.title}</p>
                              <p className="text-slate-400 text-[10px]">ID: #{ad.adId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">{ad.category?.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-sapphire">{ad.planType || '—'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-sapphire">
                          {ad.priceRange || `₹${ad.minPrice}–₹${ad.maxPrice}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {ad.status === 'PENDING_PAYMENT' && (
                            <button
                              onClick={() => setPayingAd(ad)}
                              className="px-3 py-1.5 bg-coral text-white font-bold text-[10px] rounded-lg hover:bg-red-500 transition shadow-sm"
                            >
                              Pay Now 💳
                            </button>
                          )}
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

      {/* Create Ad Modal */}
      {showCreateModal && (
        <CreateAdModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onAdCreated={handleAdCreated}
        />
      )}

      {/* Razorpay Payment Modal */}
      {payingAd && (
        <RazorpayModal
          ad={payingAd}
          onClose={() => setPayingAd(null)}
          onPaymentSuccess={handlePaymentCompleted}
        />
      )}
    </div>
  );
}
