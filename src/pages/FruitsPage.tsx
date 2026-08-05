import React from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const FruitsPage: React.FC = () => {
  const { navigateTo } = useApp();
  const fruitsList = ALL_PRODUCTS.filter(p => p.category === 'fruits');

  return (
    <div className="fruits-page">
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
            Fresh Fruits Orchard
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
          {fruitsList.map(product => (
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
