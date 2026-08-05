import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const ChocolatesPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const chocolatesList = ALL_PRODUCTS.filter(p => p.category === 'chocolates');

  const filteredChocolates = chocolatesList.filter(product => {
    if (activeFilter === 'all') return true;
    return product.subCategory === activeFilter;
  });

  const getTitleText = () => {
    switch (activeFilter) {
      case 'milk': return 'Smooth Milk Chocolates';
      case 'dark': return 'Rich Dark Chocolates';
      case 'white': return 'Creamy White & Caramel Bars';
      case 'premium': return 'Premium Nutty & Assorted Packs';
      default: return 'Chocolates Paradise';
    }
  };

  return (
    <div className="chocolates-page">
      {/* Category Pills Filter */}
      <div className="filter-section">
        <div className="filter-wrapper">
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Chocolates (30)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'milk' ? 'active' : ''}`}
            onClick={() => setActiveFilter('milk')}
          >
            Milk Chocolate (10)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'dark' ? 'active' : ''}`}
            onClick={() => setActiveFilter('dark')}
          >
            Dark Chocolate (10)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'white' ? 'active' : ''}`}
            onClick={() => setActiveFilter('white')}
          >
            White & Caramel (6)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'premium' ? 'active' : ''}`}
            onClick={() => setActiveFilter('premium')}
          >
            Nutty & Premium (4)
          </button>
          <button
            type="button"
            className="filter-pill"
            onClick={() => navigateTo('home')}
          >
            ⬅ go back
          </button>
        </div>
      </div>

      {/* Main Chocolates Grid */}
      <div className="container my-4">
        <div className="heading text-center mb-4">
          <h2
            id="gallery-title"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 35%, #7c3aed 70%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.8rem',
            }}
          >
            {getTitleText()}
          </h2>
        </div>

        <div className="box chocolates-grid d-flex flex-wrap justify-content-center">
          {filteredChocolates.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
