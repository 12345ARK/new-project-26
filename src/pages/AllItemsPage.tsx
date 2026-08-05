import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const AllItemsPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filterOptions = [
    { key: 'all', label: 'All Items(82)' },
    { key: 'fruits', label: 'Fruits(18)' },
    { key: 'vegetables', label: 'Vegetables(21)' },
    { key: 'spices', label: 'Spices(19)' },
    { key: 'snacks', label: 'Snacks & Treats(12)' },
    { key: 'Others', label: 'Others(12)' },
  ];

  const filteredProducts = ALL_PRODUCTS.filter(product => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'fruits') return product.category === 'fruits';
    if (activeFilter === 'vegetables') return product.category === 'vegetables';
    if (activeFilter === 'spices') return product.category === 'spices';
    if (activeFilter === 'snacks') return product.category === 'snacks' || product.category === 'biscuits';
    if (activeFilter === 'Others') return product.category === 'Others' || product.category === 'groceries' || product.category === 'most-viewed';
    return true;
  });

  return (
    <div className="all-items-page">
      {/* Category Pills Filter */}
      <div className="filter-section">
        <div className="filter-wrapper">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              className={`filter-pill ${activeFilter === opt.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(opt.key)}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className="filter-pill"
            onClick={() => navigateTo('home')}
          >
            ⬅ go back
          </button>
        </div>
      </div>

      {/* Main Catalog Container */}
      <div className="container my-4">
        <div className="heading text-center mb-4">
          <h3
            id="gallery-title"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 35%, #7c3aed 70%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.8rem',
            }}
          >
            {activeFilter === 'all'
              ? 'All Items Catalog'
              : `Fresh ${filterOptions.find(o => o.key === activeFilter)?.label.split('(')[0]}`}
          </h3>
        </div>

        <div className="box all-items-grid d-flex flex-wrap justify-content-center">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
