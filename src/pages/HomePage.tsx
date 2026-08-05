import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const { navigateTo } = useApp();

  // Carousel slide index state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = [
    'https://cdn.phototourl.com/free/2026-07-16-9ee4a513-0b3c-4eb8-b7dd-a16fc8e0ad41.jpg',
    'https://img.magnific.com/free-vector/world-vegan-day-sale-banner-template_23-2149741503.jpg?semt=ais_hybrid&w=740&q=80',
    'https://cdn.shopify.com/s/files/1/0734/0566/1405/files/Branded_Food_Biscuits_Cookies_L1_Mobile.jpg?v=1770877557'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const groceriesItems = ALL_PRODUCTS.filter(p => p.category === 'groceries');
  const mostViewedItems = ALL_PRODUCTS.filter(p => p.category === 'most-viewed');
  const dailyUsesItems = ALL_PRODUCTS.filter(p => p.category === 'Others');
  const freshVegs = ALL_PRODUCTS.filter(p => p.category === 'vegetables').slice(0, 8);
  const freshFruits = ALL_PRODUCTS.filter(p => p.category === 'fruits').slice(0, 15);
  const recommendedItems = ALL_PRODUCTS.filter(p => p.category === 'snacks' || p.category === 'biscuits').slice(0, 15);

  return (
    <div className="home-page">
      {/* Category Icon Slider */}
      <div className="icon-slider">
        <div className="icon-item" onClick={() => navigateTo('all-items')}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK5GfZhNpsFNSe5MwH6E56BETlDls1t_yxb9TVIrPW7g&s=10"
            alt="All Items"
          />
          <div className="icon-name">
            <h6>All-Items</h6>
          </div>
        </div>

        <div className="icon-item" onClick={() => navigateTo('vegetables')}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1gCdhJEUUJQNPWnIvx0v3iIcDE1Fo727IAVTXq8pMVA&s=10"
            alt="Vegetables"
          />
          <div className="icon-name">
            <h6>Vegetables</h6>
          </div>
        </div>

        <div className="icon-item" onClick={() => navigateTo('fruits')}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlkdbGfJEjCfPRJVuP7chHoN0Dzkabz2RMgAoxrES_Fw&s=10"
            alt="Fruits"
          />
          <div className="icon-name">
            <h6>Fruits</h6>
          </div>
        </div>

        <div className="icon-item" onClick={() => navigateTo('spices')}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRtopP96jQnCqiVBA1yjx3iUS0Qs3seo1SnXeThRj88A&s"
            alt="Spices"
          />
          <div className="icon-name">
            <h6>Spices</h6>
          </div>
        </div>

        <div className="icon-item" onClick={() => navigateTo('biscuits')}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlzs31ffF5CZq7YMphj9ozD91q4-MP6NRgnCkxdyHsBg&s"
            alt="Biscuit"
          />
          <div className="icon-name">
            <h6>Biscuit</h6>
          </div>
        </div>

        <div className="icon-item" onClick={() => navigateTo('chocolates')}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSczg90iaTWdBKE6gARi4OQbZHvpVCfeAHNy6fxayL5bA&s=10"
            alt="Chocolate"
          />
          <div className="icon-name">
            <h6>Chocolate</h6>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title"><b>Welcome to FastMart</b></h1>
          <p className="hero-lead">
            Get fresh groceries and daily essentials delivered fast to your door. Enjoy farm-fresh produce, pantry staples, and same-day delivery with zero hassle.
          </p>
          <p className="hero-subtitle">Discover Amazing Products at Unbeatable Prices</p>
        </div>
        <div className="hero-background">
          <div className="floating-box box-1">🍎</div>
          <div className="floating-box box-2">🥦</div>
          <div className="floating-box box-3">🍌</div>
          <div className="floating-box box-4">🥔</div>
        </div>
      </section>

      {/* Featured Carousel Slider */}
      <div className="carousel slide my-3" style={{ position: 'relative' }}>
        <div className="container">
          <div className="p03 carousel-inner rounded-4 overflow-hidden">
            {carouselSlides.map((imgUrl, i) => (
              <div
                key={i}
                className={`carousel-item ${i === carouselIndex ? 'active' : ''}`}
                style={{ display: i === carouselIndex ? 'block' : 'none' }}
              >
                <img src={imgUrl} className="d-block w-100" alt={`Promo Slide ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="carousel-control-prev"
          onClick={() => setCarouselIndex(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
          style={{ background: 'none', border: 'none', position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 10, cursor: 'pointer' }}
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button
          type="button"
          className="carousel-control-next"
          onClick={() => setCarouselIndex(prev => (prev + 1) % carouselSlides.length)}
          style={{ background: 'none', border: 'none', position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 10, cursor: 'pointer' }}
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>

      {/* Groceries Section */}
      <div className="containerA" id="groceries">
        <div className="heading">
          <h2>Groceries Items ⬇</h2>
        </div>
        <div className="box">
          {groceriesItems.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
        <div className="text-end me-3">
          <button
            type="button"
            className="btn btn-link text-dark fw-bold text-decoration-none"
            onClick={() => navigateTo('all-items')}
          >
            More Items &#x2192;
          </button>
        </div>
      </div>

      {/* Most Viewed Items Section */}
      <div className="containerA my-4">
        <div className="heading">
          <h2>Most Viewed Items ⬇</h2>
        </div>
        <div className="box">
          {mostViewedItems.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>

      {/* Daily Uses Items Section */}
      <div className="p6-boss my-4">
        <div className="p6-heading">
          <h2>Daily Uses Items ⬇</h2>
        </div>
        <div className="p6-cont">
          <div className="p6-box1">
            <div className="p6-img">
              <img
                src="https://cdn.phototourl.com/free/2026-07-17-695d1412-7e14-4fed-bcf2-215502cf75ee.jpg"
                alt="Best Deals Promo"
              />
            </div>
          </div>
          <div className="p6-box2">
            <div className="p6-box">
              {dailyUsesItems.map(item => (
                <ProductCard key={item.id} product={item} variant="small" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fresh Vegetables Section */}
      <div className="containerB my-4" id="vegetables">
        <div className="headingB">
          <h2>Fresh Vegetables &#x2192;</h2>
        </div>
        <div className="boxB">
          {freshVegs.map(item => (
            <ProductCard key={item.id} product={item} variant="horizontal" />
          ))}
        </div>
        <div className="text-end me-3">
          <button
            type="button"
            className="btn btn-link text-dark fw-bold text-decoration-none"
            onClick={() => navigateTo('vegetables')}
          >
            More Items &#x2192;
          </button>
        </div>
      </div>

      {/* Promo Banner Image */}
      <div className="banr my-4">
        <div className="crd-item">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzB6X1DDR8W00y26DhIuxuz8Ie6SL4Uj2X6nP26td29qCCKTiFQFx_yWMu&s=10"
            alt="Big Sale Banner"
          />
        </div>
      </div>

      {/* Fruits Section */}
      <div className="containerA my-4" id="fruits">
        <div className="heading">
          <h2>Fruits ⬇</h2>
        </div>
        <div className="box">
          {freshFruits.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
        <div className="text-end me-3">
          <button
            type="button"
            className="btn btn-link text-dark fw-bold text-decoration-none"
            onClick={() => navigateTo('fruits')}
          >
            More Items &#x2192;
          </button>
        </div>
      </div>

      {/* Promo Banner Image 2 */}
      <div className="banr my-4">
        <div className="crd-item">
          <img
            src="https://cdn.phototourl.com/free/2026-07-18-da2949f5-d671-45ea-ba39-69704ab4b192.jpg"
            alt="Big Sale Banner"
          />
        </div>
      </div>

      {/* Recommended Section */}
      <div className="containerA my-4">
        <div className="heading">
          <h2>Recommended For You ⬇</h2>
        </div>
        <div className="box">
          {recommendedItems.map(item => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>

      {/* About FastMart Section */}
      <section className="about" id="about">
        <h2>About FastMart</h2>
        <div className="about-text">
          <p>
            Welcome to <span>FastMart</span>, where we make healthy eating simple and hassle-free. We understand that life gets busy, which is why we handle the heavy lifting of grocery shopping for you. From crisp farm vegetables to everyday household essentials, we deliver everything you need right when you need it.
            <br /><br />
            FastMart is your premier destination for premium products, items, and exceptional shopping experiences. With over a decade of service, we've built a reputation for quality, reliability, and customer satisfaction.
          </p>
          <div className="stats">
            <div className="stat">
              <h3>50K+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat">
              <h3>10K+</h3>
              <p>Products</p>
            </div>
            <div className="stat">
              <h3>99.8%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
