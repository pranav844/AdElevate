import React from 'react';

export default function HeroBanner({ 
  searchQuery, 
  setSearchQuery, 
  cityQuery, 
  setCityQuery, 
  selectedCategory, 
  setSelectedCategory,
  onSearch 
}) {
  const categoriesList = [
    { label: 'All Categories', value: 'All' },
    { label: 'Electronics', value: 'ELECTRONICS' },
    { label: 'Fashion', value: 'FASHION' },
    { label: 'Food & Dining', value: 'FOOD_AND_BEVERAGES' },
    { label: 'Beauty & Wellness', value: 'BEAUTY_AND_WELLNESS' },
    { label: 'Home Services', value: 'SERVICES' },
    { label: 'Education', value: 'EDUCATION' },
    { label: 'Automobile', value: 'AUTOMOBILE' },
    { label: 'Real Estate', value: 'REAL_ESTATE' },
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <section className="bg-navy text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sapphire rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        
        <p className="text-coral font-semibold text-sm tracking-wider uppercase mb-3">
          India's trusted business & ad platform
        </p>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
          Find trusted local services <br className="hidden sm:inline" />
          <span className="text-slate-300">& businesses near you</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8">
          Connect with verified providers, compare nearby options, and discover top-rated local advertisements.
        </p>

        {/* Search Panel */}
        <form onSubmit={handleFormSubmit} className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Query Input */}
            <div className="sm:col-span-5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, shops, ads..."
                className="w-full bg-white text-charcoal px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral font-medium"
              />
            </div>

            {/* City Location Input */}
            <div className="sm:col-span-3">
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="City (e.g. Mumbai)"
                className="w-full bg-white text-charcoal px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral font-medium"
              />
            </div>

            {/* Category Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white text-charcoal px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-coral font-medium cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full h-full bg-coral hover:bg-red-500 text-white font-bold py-3 rounded-xl text-sm transition shadow"
              >
                Search
              </button>
            </div>

          </div>
        </form>

        {/* Platform Stats */}
        <div className="flex justify-center items-center gap-8 mt-10 text-slate-300 text-xs sm:text-sm">
          <div><strong className="text-white text-base sm:text-lg">500+</strong> Active Ads</div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div><strong className="text-white text-base sm:text-lg">200+</strong> Verified Vendors</div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div><strong className="text-white text-base sm:text-lg">4.8 ★</strong> Avg Rating</div>
        </div>

      </div>
    </section>
  );
}
