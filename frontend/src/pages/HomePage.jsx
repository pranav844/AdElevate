import React from 'react';
import HeroBanner from '../components/HeroBanner';
import CategoryBar from '../components/CategoryBar';
import AdGrid from '../components/AdGrid';

export default function HomePage({
  selectedCategory, setSelectedCategory,
  searchQuery, setSearchQuery,
  cityQuery, setCityQuery,
  currentUser, onPayAd, onRateAd, refreshTrigger
}) {
  return (
    <>
      <HeroBanner
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        cityQuery={cityQuery} setCityQuery={setCityQuery}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        onSearch={() => {}}
      />
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <AdGrid
        key={refreshTrigger}
        category={selectedCategory}
        cityQuery={cityQuery}
        searchQuery={searchQuery}
        currentUser={currentUser}
        onPayAd={onPayAd}
        onRateAd={onRateAd}
      />
    </>
  );
}
