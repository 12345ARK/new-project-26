import React from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const VegetablesPage: React.FC = () => {
  const { navigateTo } = useApp();
  const vegetablesList = ALL_PRODUCTS.filter(p => p.category === 'vegetables');

  return (
    <div className="vegetables-page">
      <div className="containerA my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2
            className="m-0"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 35%, #7c3aed 70%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.8rem',
            }}
          >
            Fresh Vegetables Market
          </h2>
          <button
            type="button"
            className="filter-pill"
            onClick={() => navigateTo('home')}
          >
            ⬅ go back
          </button>
        </div>

        <div className="box d-flex flex-wrap justify-content-center">
          {vegetablesList.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-4 text-end">
          <button
            type="button"
            className="filter-pill"
            onClick={() => navigateTo('home')}
          >
            ⬅ go back
          </button>
        </div>
      </div>
    </div>
  );
};
