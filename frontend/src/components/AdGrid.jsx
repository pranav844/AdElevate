import React, { useEffect, useState } from 'react';
import AdCard from './AdCard';
import { getAds } from '../services/api';

export default function AdGrid({ category, cityQuery, searchQuery, currentUser, onPayAd, onRateAd }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLiveAds = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call live backend API
      const data = await getAds({ category, city: cityQuery });
      setAds(data || []);
    } catch (err) {
      console.error('Failed to fetch ads:', err);
      setError('Could not connect to Core Backend (Port 9090). Ensure Spring Boot is running!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAds();
  }, [category, cityQuery]);

  const PLAN_PRIORITY = {
    PLATINUM: 3,
    GOLD: 2,
    SILVER: 1,
  };

  // Client-side search query filter + Plan Priority Sorting (PLATINUM > GOLD > SILVER)
  const filteredAds = ads
    .filter((ad) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        ad.title?.toLowerCase().includes(q) ||
        ad.description?.toLowerCase().includes(q) ||
        ad.category?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const priorityA = PLAN_PRIORITY[a.planType?.toUpperCase()] || 0;
      const priorityB = PLAN_PRIORITY[b.planType?.toUpperCase()] || 0;
      return priorityB - priorityA; // Platinum (3) first, then Gold (2), then Silver (1)
    });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="featured">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <p className="text-coral font-bold text-xs uppercase tracking-wider">Live Marketplace</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            {category === 'All' || !category ? 'Featured Advertisements' : `${category} Advertisements`}
          </h2>
        </div>
        <div className="text-sm text-slate-500 mt-2 sm:mt-0 font-medium">
          Showing <strong>{filteredAds.length}</strong> live listings
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center my-6">
          <p className="font-semibold text-base mb-2">⚠️ Connection Alert</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchLiveAds}
            className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition"
          >
            Retry Connection 🔄
          </button>
        </div>
      )}

      {/* Ads Grid */}
      {!loading && !error && filteredAds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredAds.map((ad) => (
            <AdCard 
              key={ad.adId || Math.random()} 
              ad={ad} 
              currentUser={currentUser}
              onPayClick={onPayAd}
              onRateClick={onRateAd}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAds.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm my-6">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-navy text-lg mb-1">No Ads Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            We couldn't find any live ads matching your selected filter. Try changing category or location.
          </p>
        </div>
      )}

    </section>
  );
}
