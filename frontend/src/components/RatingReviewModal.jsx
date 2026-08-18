import React, { useEffect, useState } from 'react';
import { getRatingsByAd, submitRating } from '../services/api';

export default function RatingReviewModal({ ad, currentUser, onClose, onReviewSubmitted, onLoginRequired }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rating Form State
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  // Fetch Existing Ratings for this Ad
  const loadRatings = async () => {
    setLoading(true);
    try {
      const data = await getRatingsByAd(ad.adId);
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ad) loadRatings();
  }, [ad]);

  // Submit New Rating
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // 🛑 Check Role Security on Frontend
    if (!currentUser) {
      if (onLoginRequired) onLoginRequired();
      return;
    }

    if (currentUser.role !== 'CUSTOMER') {
      setFormStatus('⚠️ Only Customer accounts are allowed to submit ratings.');
      return;
    }

    const customerId = currentUser?.userId || currentUser?.id || currentUser?.customerId;
    if (!customerId) {
      setFormStatus('⚠️ User session ID missing. Please logout and login again.');
      return;
    }

    setSubmitting(true);
    setFormStatus('');

    try {
      const payload = {
        ratingValue: Number(ratingValue),
        reviewText: reviewText,
        adId: ad.adId,
        customerId: Number(customerId),
      };
      await submitRating(payload);
      setFormStatus('🎉 Review submitted successfully!');
      setReviewText('');
      loadRatings(); // Refresh reviews list
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      console.error('Rating error:', err);
      setFormStatus(`Error: ${err.message || 'Failed to submit review'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col justify-between">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-4 mb-4">
          <span className="text-coral font-bold text-xs uppercase tracking-wider">Ratings & Customer Reviews</span>
          <h3 className="text-xl font-extrabold text-navy line-clamp-1">{ad.title}</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Average Rating: <strong className="text-amber-500">★ {ad.averageRating ? ad.averageRating.toFixed(1) : 'New'}</strong> ({ad.totalReviews || 0} reviews)
          </p>
        </div>

        {/* Scrollable Reviews List */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1 max-h-60 no-scrollbar">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading reviews...</p>
          ) : reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.ratingId || Math.random()} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-navy">{rev.customerName || 'Customer User'}</span>
                  <span className="text-amber-400 font-bold">{'★'.repeat(rev.ratingValue)}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{rev.reviewText || 'No comment provided.'}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No reviews submitted for this ad yet. Be the first to review!
            </div>
          )}
        </div>

        {/* Role-Based Review Form Area */}
        {currentUser && currentUser.role === 'CUSTOMER' ? (
          /* CUSTOMER FORM */
          <form onSubmit={handleSubmitReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-navy text-xs mb-3">Write a Customer Review</h4>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500 font-medium">Select Stars:</span>
              <div className="flex gap-1 text-lg cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className={star <= ratingValue ? 'text-amber-400' : 'text-slate-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review experience here..."
              required
              rows="2"
              className="w-full bg-white text-charcoal p-3 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral mb-3"
            ></textarea>

            {formStatus && (
              <p className="text-xs font-semibold mb-2 text-center text-emerald-600">{formStatus}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-navy hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow"
            >
              {submitting ? 'Submitting...' : 'Submit Review ★'}
            </button>
          </form>
        ) : currentUser && currentUser.role === 'VENDOR' ? (
          /* VENDOR NOTICE */
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-center text-xs">
            🔒 <strong>Vendor Account Notice:</strong> Vendors cannot post reviews on listings. Please switch to a Customer account to write reviews.
          </div>
        ) : (
          /* GUEST PROMPT */
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl text-center text-xs">
            <p className="mb-2">Login as a <strong>Customer</strong> to rate and review this ad.</p>
            <button
              onClick={onLoginRequired}
              className="px-4 py-1.5 bg-coral text-white font-bold rounded-xl text-xs hover:bg-red-500 transition shadow-sm"
            >
              Sign In to Review
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
