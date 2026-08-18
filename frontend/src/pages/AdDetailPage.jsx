import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdById, getRatingsByAd } from '../services/api';
import RatingReviewModal from '../components/RatingReviewModal';

export default function AdDetailPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadAdAndReviews();
  }, [id]);

  const loadAdAndReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const adData = await getAdById(id);
      setAd(adData);
      
      // Load customer reviews for this ad
      try {
        const ratingData = await getRatingsByAd(id);
        setReviews(ratingData || []);
      } catch (e) {
        console.error('Failed to load reviews:', e);
      }
    } catch (err) {
      console.error('Failed to load ad details:', err);
      setError('Ad not found or removed.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeClass = (planType) => {
    switch (planType?.toUpperCase()) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'GOLD':     return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SILVER':   return 'bg-slate-100 text-slate-700 border-slate-300';
      default:         return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-misty flex items-center justify-center p-8">
        <div className="text-slate-500 font-bold text-sm animate-pulse">Loading ad details...</div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-misty p-8 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mt-12">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-xl font-bold text-navy mb-2">{error || 'Ad Not Found'}</h2>
          <p className="text-slate-500 text-xs mb-6">The advertisement you are looking for does not exist or has been removed.</p>
          <Link to="/" className="px-5 py-2.5 bg-coral text-white font-bold text-xs rounded-xl hover:bg-red-500 transition">
            ← Back to All Ads
          </Link>
        </div>
      </div>
    );
  }

  const isCustomer = currentUser && currentUser.role === 'CUSTOMER';

  return (
    <div className="min-h-screen bg-misty py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-coral font-bold text-xs uppercase tracking-wider hover:underline flex items-center gap-1">
            ← Back to Featured Listings
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left Image Column */}
            <div className="relative h-80 md:h-full min-h-[320px] bg-slate-100 overflow-hidden">
              <img
                src={ad.productImage || 'https://picsum.photos/600/400'}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${getPlanBadgeClass(ad.planType)}`}>
                  {ad.planType || 'STANDARD'} PLAN
                </span>
              </div>
            </div>

            {/* Right Details Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-bold uppercase tracking-wider text-sapphire">{ad.category}</span>
                  <span>📍 {ad.city || 'Mumbai'}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy leading-snug mb-3">
                  {ad.title}
                </h1>

                {/* Price Display */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Indicative Price Range</p>
                  <p className="text-2xl font-extrabold text-sapphire">
                    {ad.priceRange || `₹${ad.minPrice?.toLocaleString()} – ₹${ad.maxPrice?.toLocaleString()}`}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About This Product / Service</h3>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {ad.description || 'No detailed description provided by the vendor.'}
                  </p>
                </div>
              </div>

              {/* Vendor & Action Row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Listing Vendor</p>
                  <p className="text-xs font-bold text-navy">Vendor #{ad.vendorId || 1}</p>
                </div>

                {isCustomer ? (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-5 py-2.5 bg-coral hover:bg-red-500 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    ★ Rate & Review
                  </button>
                ) : !currentUser ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2.5 bg-sapphire hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow"
                  >
                    Sign In to Review 🔐
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                    Vendor View Mode
                  </span>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Customer Reviews & Ratings</h2>
              <p className="text-slate-400 text-xs mt-0.5">Real feedback from verified customers</p>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
              <span className="text-amber-500 text-xl font-bold">★</span>
              <span className="font-extrabold text-navy text-lg">
                {ad.averageRating ? ad.averageRating.toFixed(1) : 'New'}
              </span>
              <span className="text-slate-400 text-xs font-medium">({reviews.length} reviews)</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <div className="text-3xl mb-2">💬</div>
              No reviews submitted for this advertisement yet. Be the first customer to leave a review!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev, idx) => (
                <div key={rev.ratingId || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sapphire text-white font-bold text-xs flex items-center justify-center uppercase">
                        {rev.customerName ? rev.customerName[0] : 'C'}
                      </div>
                      <span className="font-bold text-navy text-xs">{rev.customerName || 'Customer'}</span>
                    </div>
                    <div className="flex text-amber-400 text-xs font-bold">
                      {'★'.repeat(rev.ratingValue || 5)}
                      <span className="text-slate-300">{'★'.repeat(5 - (rev.ratingValue || 5))}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{rev.reviewText || 'No comment provided.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <RatingReviewModal
          ad={ad}
          currentUser={currentUser}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => {
            setShowReviewModal(false);
            loadAdAndReviews(); // Reload page reviews
          }}
        />
      )}
    </div>
  );
}
