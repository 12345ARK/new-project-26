import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const BiscuitsPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const biscuitsList = ALL_PRODUCTS.filter(p => p.category === 'biscuits');

  const filteredBiscuits = biscuitsList.filter(product => {
    if (activeFilter === 'all') return true;
    return product.subCategory === activeFilter;
  });

  const getTitleText = () => {
    switch (activeFilter) {
      case 'cream': return 'Choco & Creamy Delights';
      case 'sweet': return 'Rich Butter & Sweet Treats';
      case 'salted': return 'Salted Crackers & Appetizers';
      case 'healthy': return 'Healthy Oat & Multi-grain Cookies';
      default: return 'Delicious Biscuits Corner';
    }
  };

  return (
    <div className="biscuits-page">
      {/* Category Pills Filter */}
      <div className="filter-section">
        <div className="filter-wrapper">
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Biscuits (30)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'cream' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cream')}
          >
            Cream & Choco (10)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'sweet' ? 'active' : ''}`}
            onClick={() => setActiveFilter('sweet')}
          >
            Sweet & Butter (10)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'salted' ? 'active' : ''}`}
            onClick={() => setActiveFilter('salted')}
          >
            Salted & Crackers (6)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'healthy' ? 'active' : ''}`}
            onClick={() => setActiveFilter('healthy')}
          >
            Healthy & Oats (4)
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

      {/* Main Biscuits Grid */}
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

        <div className="box biscuits-grid d-flex flex-wrap justify-content-center">
          {filteredBiscuits.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
