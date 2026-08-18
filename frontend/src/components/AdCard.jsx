import React from "react";
import { Link } from "react-router-dom";

export default function AdCard({ ad, currentUser, onPayClick, onRateClick }) {
  // Plan Badge colors matching Backend Enum (PLATINUM / GOLD / SILVER)
  const isVendor = currentUser && currentUser.role === "VENDOR";
  const getPlanBadgeClass = (planType) => {
    switch (planType?.toUpperCase()) {
      case "PLATINUM":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "GOLD":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "SILVER":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Ad Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
      case "ACTIVE":
        return (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            APPROVED
          </span>
        );
      case "PENDING_PAYMENT":
        return (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            PENDING PAYMENT
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            PENDING APPROVAL
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Banner */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={ad.productImage || "https://picsum.photos/400/250"}
          alt={ad.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm ${getPlanBadgeClass(ad.planType)}`}
          >
            {ad.planType || "STANDARD"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {getStatusBadge(ad.status)}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-sapphire">
              {ad.category}
            </span>
            <span>📍 {ad.city || "Mumbai"}</span>
          </div>

          <h3 className="font-bold text-navy text-lg leading-snug mb-2 line-clamp-1">
            {ad.title}
          </h3>

          <p className="text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">
            {ad.description || "No description provided."}
          </p>
        </div>

        {/* Rating & Price Row */}
        <div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-4">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => onRateClick && onRateClick(ad)}
            >
              <span className="text-amber-400 font-bold text-sm">★</span>
              <span className="font-bold text-navy text-sm">
                {ad.averageRating ? ad.averageRating.toFixed(1) : "New"}
              </span>
              <span className="text-slate-400 text-xs">
                ({ad.totalReviews || 0})
              </span>
            </div>
            <div className="font-extrabold text-sapphire text-base">
              {ad.priceRange || `₹${ad.minPrice} - ₹${ad.maxPrice}`}
            </div>
          </div>

          {/* Action Buttons */}
          {isVendor ? (
            /* VENDOR VIEW: Hide Reviews button */
            <div>
              {ad.status === "PENDING_PAYMENT" ? (
                <button
                  onClick={() => onPayClick && onPayClick(ad)}
                  className="w-full py-2.5 bg-coral hover:bg-red-500 text-white font-bold text-xs rounded-xl transition shadow"
                >
                  Pay Now 💳
                </button>
              ) : ad.status === "PENDING_APPROVAL" ? (
                <div className="w-full py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl text-center border border-blue-200">
                  Paid (Pending Approval) ⏳
                </div>
              ) : (
                <div className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl text-center border border-emerald-200">
                  Active Listing ✓
                </div>
              )}
            </div>
          ) : (
            /* CUSTOMER / GUEST VIEW: Show Reviews & View Details (NO Pay Now) */
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onRateClick && onRateClick(ad)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-navy font-semibold text-xs rounded-xl transition font-bold"
              >
                ★ Reviews
              </button>

              <Link
                to={`/ad/${ad.adId}`}
                className="w-full py-2 bg-sapphire hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow text-center flex items-center justify-center"
              >
                View Details →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
