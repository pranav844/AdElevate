import React from 'react';

export default function CategoryBar({ selectedCategory, onSelectCategory }) {
  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Electronics', value: 'ELECTRONICS' },
    { label: 'Fashion', value: 'FASHION' },
    { label: 'Food & Dining', value: 'FOOD_AND_BEVERAGES' },
    { label: 'Beauty & Wellness', value: 'BEAUTY_AND_WELLNESS' },
    { label: 'Home Services', value: 'SERVICES' },
    { label: 'Education', value: 'EDUCATION' },
    { label: 'Automobile', value: 'AUTOMOBILE' },
    { label: 'Real Estate', value: 'REAL_ESTATE' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-4 shadow-sm" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
