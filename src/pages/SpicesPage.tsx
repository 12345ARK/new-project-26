import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const SpicesPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const spicesList = ALL_PRODUCTS.filter(p => p.category === 'spices');

  const filteredSpices = spicesList.filter(product => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'whole') return product.subCategory === 'whole';
    if (activeFilter === 'powder') return product.subCategory === 'powder';
    return true;
  });

  return (
    <div className="spices-page">
      {/* Category Pills Filter */}
      <div className="filter-section">
        <div className="filter-wrapper">
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Spices(18)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'whole' ? 'active' : ''}`}
            onClick={() => setActiveFilter('whole')}
          >
            Whole Spices(9)
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'powder' ? 'active' : ''}`}
            onClick={() => setActiveFilter('powder')}
          >
            Powder Spices(9)
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

      {/* Main Spices Grid */}
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
            {activeFilter === 'all'
              ? 'Aromatic Spices Bazaar'
              : activeFilter === 'whole'
              ? 'Authentic Whole Spices'
              : 'Pure Ground Spices'}
          </h2>
        </div>

        <div className="box spices-grid d-flex flex-wrap justify-content-center">
          {filteredSpices.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
