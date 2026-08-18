import React, { useState } from 'react';
import { createAd } from '../services/api';

const CATEGORIES = [
  'ELECTRONICS', 'FASHION', 'FOOD_AND_BEVERAGES', 'BEAUTY_AND_WELLNESS',
  'SERVICES', 'EDUCATION', 'AUTOMOBILE', 'REAL_ESTATE', 'HEALTHCARE',
  'GROCERY', 'FURNITURE', 'HOME_APPLIANCES', 'SPORTS_AND_FITNESS',
  'ENTERTAINMENT', 'TRAVEL_AND_TOURISM', 'BOOKS_AND_STATIONERY',
  'PET_SUPPLIES', 'TOYS_AND_GAMES', 'JEWELRY', 'SOFTWARE_AND_IT', 'OTHER'
];

const PLANS = [
  { id: 1, label: 'Platinum Plan — ₹1,299 (Highest Visibility)', name: 'PLATINUM' },
  { id: 2, label: 'Gold Plan — ₹799 (High Visibility)', name: 'GOLD' },
  { id: 3, label: 'Silver Plan — ₹499 (Standard)', name: 'SILVER' },
];

export default function CreateAdModal({ currentUser, onClose, onAdCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
  const [productImage, setProductImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [category, setCategory] = useState('ELECTRONICS');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [planId, setPlanId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Local image size should be less than 10MB.');
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize image to compact 400x300 (~12KB)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to super lightweight JPEG Base64 (~12KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        setProductImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Basic validation
    if (!title.trim()) { setErrorMsg('Ad title is required.'); return; }
    if (!description.trim()) { setErrorMsg('Description is required.'); return; }
    if (Number(minPrice) <= 0) { setErrorMsg('Min price must be greater than 0.'); return; }
    if (Number(maxPrice) <= 0) { setErrorMsg('Max price must be greater than 0.'); return; }
    if (Number(maxPrice) < Number(minPrice)) { setErrorMsg('Max price must be greater than or equal to Min price.'); return; }

    // Extract valid vendorId (must belong to logged in vendor)
    const storedUser = localStorage.getItem('adelevate_user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const resolvedVendorId = currentUser?.userId || currentUser?.vendorId || parsedUser?.userId || parsedUser?.vendorId;

    if (!resolvedVendorId) {
      setErrorMsg('Session expired or missing vendor ID. Please logout and login again.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        productImage: productImage.trim() || `https://picsum.photos/400/250?random=${Math.floor(Math.random() * 100)}`,
        category,
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice),
        vendorId: Number(resolvedVendorId),
        planId: Number(planId),
        locationId: 1,
        expirationDate: '2026-12-31',
      };

      const newAd = await createAd(payload);
      if (onAdCreated) onAdCreated(newAd);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post advertisement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
        >✕</button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-coral font-bold text-xs uppercase tracking-wider">Vendor Portal</span>
          <h3 className="text-2xl font-extrabold text-navy">Post New Advertisement</h3>
          <p className="text-slate-500 text-xs mt-1">Fill in your ad details. Payment will be processed after submission.</p>
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
            <label className="block text-xs font-bold text-navy mb-1">Ad Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Trendy Summer Collection Sale"
              className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy mb-1">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product or service in detail..."
              rows="3"
              className="w-full bg-slate-50 p-3 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Subscription Plan *</label>
              <select value={planId} onChange={(e) => setPlanId(e.target.value)}
                className="w-full bg-slate-50 px-3 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium cursor-pointer"
              >
                {PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>{plan.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Min Price (₹) *</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                placeholder="499" min="1"
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy mb-1">Max Price (₹) *</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="1999" min="1"
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
              />
            </div>
          </div>

          {/* Image Input Section: Local File Upload vs Web Image URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-navy">Product Image (Optional)</label>
              <div className="flex gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => { setImageMode('upload'); setProductImage(''); setImageFileName(''); }}
                  className={`px-2.5 py-1 rounded-lg transition ${imageMode === 'upload' ? 'bg-coral text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  📁 Local Upload
                </button>
                <button
                  type="button"
                  onClick={() => { setImageMode('url'); setProductImage(''); setImageFileName(''); }}
                  className={`px-2.5 py-1 rounded-lg transition ${imageMode === 'url' ? 'bg-coral text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  🌐 Image URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/80 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="local-image-upload"
                  className="hidden"
                />
                <label htmlFor="local-image-upload" className="cursor-pointer block">
                  {productImage ? (
                    <div className="relative group max-w-[220px] mx-auto">
                      <img src={productImage} alt="Local Preview" className="h-28 w-full object-cover rounded-lg shadow-sm border border-slate-200" />
                      <p className="text-[10px] font-medium text-slate-500 truncate mt-1">{imageFileName || 'Selected Image'}</p>
                      <span className="text-[10px] text-coral font-bold block mt-0.5">Click to choose another photo 🔄</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl mb-1">📸</div>
                      <p className="text-xs font-bold text-navy">Click to browse & upload local image</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-coral font-medium"
                />
                {productImage ? (
                  <img src={productImage} alt="URL Preview" className="h-24 w-full object-cover rounded-lg mt-2 border border-slate-200" />
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Leave empty to use a random placeholder image.</p>
                )}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-coral hover:bg-red-500 text-white font-bold text-sm rounded-xl transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Submitting Ad...' : 'Submit Ad & Proceed to Pay 💳'}
          </button>

        </form>
      </div>
    </div>
  );
}
