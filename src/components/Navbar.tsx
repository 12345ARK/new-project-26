import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS } from '../data/products';
import { Product } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentView,
    authInitialMode,
    navigateTo,
    cart,
    setIsCartOpen,
    isLoggedIn,
    username,
    logoutUser,
    setIsUserDrawerOpen,
    setSelectedProductModal,
    openTrackOrderModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  // Recent Searches State
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fastmart_recent_searches');
      return saved ? JSON.parse(saved) : ['Fresh Milk', 'Organic Apples', 'Chocolates', 'Basmati Rice'];
    } catch {
      return ['Fresh Milk', 'Organic Apples', 'Chocolates', 'Basmati Rice'];
    }
  });

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('fastmart_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(item => item !== termToRemove);
      try {
        localStorage.setItem('fastmart_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('fastmart_recent_searches');
    } catch (e) {
      console.error(e);
    }
  };

  const navRef = useRef<HTMLElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close search & menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
        setIsMobileSearchActive(false);
        setIsMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const matches = ALL_PRODUCTS.filter(p => p.title.toLowerCase().includes(q));
    setSearchResults(matches);
  };

  const handleMobileSearchChange = (query: string) => {
    setMobileSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase().trim();
    const matches = ALL_PRODUCTS.filter(p => p.title.toLowerCase().includes(q));
    setSearchResults(matches);
  };

  const handleProductSelect = (product: Product) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    } else {
      saveRecentSearch(product.title);
    }
    setSelectedProductModal(product);
    setIsSearchOpen(false);
    setSearchQuery('');
    setMobileSearchQuery('');
    setIsMobileSearchActive(false);
    setIsMobileMenuOpen(false);
  };

  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="nav-wrapper">
        {/* Brand Logo */}
        <div className="nav-logo" onClick={() => navigateTo('home')}>
          <i className="fas fa-shopping-bag"></i>
          <span>FastMart</span>
        </div>

        {/* Desktop Search Bar */}
        <div className="search-wrapper desktop-search" ref={desktopSearchRef}>
          <input
            type="text"
            className="search-input"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleKeyDownSearch}
          />
          <button
            className="search-btn"
            title="Search"
            onClick={() => {
              if (searchQuery.trim()) {
                saveRecentSearch(searchQuery);
                setIsSearchOpen(true);
              }
            }}
          >
            <i className="fas fa-search"></i>
          </button>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="search-results-dropdown active">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  searchResults.slice(0, 8).map(product => (
                    <div
                      key={product.id}
                      className="search-item"
                      onClick={() => handleProductSelect(product)}
                    >
                      <img src={product.image} alt={product.title} />
                      <div>
                        <h4>{product.title}</h4>
                        <p>₹{product.price}{product.unit ? product.unit : ''}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-result">No products found</div>
                )
              ) : (
                /* Recent Searches Section */
                recentSearches.length > 0 ? (
                  <div className="p-2 bg-white">
                    <div className="d-flex align-items-center justify-content-between pb-2 mb-1 border-bottom">
                      <span className="small text-muted fw-bold d-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
                        <i className="fas fa-history text-danger"></i> Recent Searches
                      </span>
                      <button
                        type="button"
                        className="btn btn-link text-muted p-0 text-decoration-none"
                        style={{ fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentSearches();
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="d-flex flex-column gap-1">
                      {recentSearches.map((term, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center justify-content-between p-2 rounded-2 hover-bg-light cursor-pointer transition-all"
                          style={{ fontSize: '0.88rem' }}
                          onClick={() => {
                            handleSearchChange(term);
                            saveRecentSearch(term);
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 text-dark">
                            <i className="fas fa-clock text-muted" style={{ fontSize: '0.8rem' }}></i>
                            <span>{term}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm text-muted p-0 border-0 hover-text-danger"
                            title="Remove from history"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(term);
                            }}
                          >
                            <i className="fas fa-times" style={{ fontSize: '0.8rem' }}></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white text-center">
                    <small className="text-muted d-block mb-2">Popular Categories</small>
                    <div className="d-flex flex-wrap justify-content-center gap-1.5">
                      {['Vegetables', 'Fruits', 'Biscuits', 'Chocolates', 'Spices'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className="btn btn-sm btn-light border rounded-pill px-2.5 py-1"
                          style={{ fontSize: '0.78rem' }}
                          onClick={() => {
                            handleSearchChange(cat);
                            saveRecentSearch(cat);
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Desktop Navigation Menu */}
        <ul className="nav-menu">
          <li>
            <a
              href="#"
              className={currentView === 'home' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#"
              className={currentView === 'all-items' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigateTo('all-items'); }}
            >
              Products
            </a>
          </li>

          {/* More Dropdown */}
          <li
            className="nav-dropdown"
            onMouseEnter={() => setIsMoreDropdownOpen(true)}
            onMouseLeave={() => setIsMoreDropdownOpen(false)}
          >
            <a href="#" className="dropdown-trigger" onClick={(e) => e.preventDefault()}>
              More <i className="fas fa-chevron-down ms-1" style={{ fontSize: '0.8rem' }}></i>
            </a>
            {isMoreDropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); navigateTo('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}>
                    <i className="fas fa-comment-dots me-1"></i> Feedback & Support
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('admin'); }} className="text-danger fw-bold">
                    <i className="fas fa-user-shield me-1"></i> Admin Panel
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-danger fw-bold d-inline-flex align-items-center gap-1"
                    onClick={(e) => { e.preventDefault(); openTrackOrderModal(); }}
                    title="Track Live Order"
                  >
                    <i className="fas fa-truck-fast text-danger"></i> Track Order
                  </a>
                </li>
                {isLoggedIn ? (
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); logoutUser(); }}>
                      <i className="fas fa-sign-out-alt me-1"></i> Logout ({username})
                    </a>
                  </li>
                ) : (
                  <>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('login', 'signin'); }}>
                        <i className="fas fa-sign-in-alt me-1"></i> Sign In
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-danger fw-bold" onClick={(e) => { e.preventDefault(); navigateTo('login', 'signup'); }}>
                        <i className="fas fa-user-plus me-1"></i> Register / Sign Up
                      </a>
                    </li>
                  </>
                )}
              </ul>
            )}
          </li>
        </ul>

        {/* Navbar Right Icons */}
        <div className="nav-icons">
          {/* Mobile Search Toggle */}
          <button
            className="icon-btn mobile-search-icon"
            onClick={() => {
              setIsMobileSearchActive(!isMobileSearchActive);
              setIsMobileMenuOpen(false);
            }}
            title="Search"
          >
            <i className="fas fa-search"></i>
          </button>

          {/* Cart Icon */}
          <button
            className="icon-btn"
            onClick={() => {
              setIsCartOpen(true);
              setIsMobileMenuOpen(false);
            }}
            title="Shopping Cart"
          >
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-badge">{totalCartCount}</span>
          </button>

          {/* User Account Drawer Icon */}
          <button
            className="icon-btn"
            onClick={() => {
              setIsUserDrawerOpen(true);
              setIsMobileMenuOpen(false);
            }}
            title="My Account"
          >
            <i className="fas fa-user-circle"></i>
          </button>

          {/* Hamburger Menu Icon */}
          <button
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileSearchActive(false);
            }}
            title="Menu"
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Wrapper */}
      {isMobileSearchActive && (
        <div className="mobile-search-wrapper active">
          <input
            type="text"
            className="mobile-search-input"
            placeholder="Search catalog..."
            value={mobileSearchQuery}
            onChange={(e) => handleMobileSearchChange(e.target.value)}
            autoFocus
          />
          <button className="mobile-search-submit">
            <i className="fas fa-search"></i>
          </button>
          <button
            className="mobile-search-close"
            onClick={() => {
              setIsMobileSearchActive(false);
              setMobileSearchQuery('');
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Mobile Search Results & Recent Searches */}
      {isMobileSearchActive && (
        <div className="mobile-search-results active" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {mobileSearchQuery.trim() ? (
            searchResults.length > 0 ? (
              searchResults.map(product => (
                <div
                  key={product.id}
                  className="search-item"
                  onClick={() => handleProductSelect(product)}
                >
                  <img src={product.image} alt={product.title} />
                  <div>
                    <h4>{product.title}</h4>
                    <p>₹{product.price}{product.unit ? product.unit : ''}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-result">No products found</div>
            )
          ) : (
            recentSearches.length > 0 ? (
              <div className="p-3 bg-white">
                <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                  <span className="small text-muted fw-bold d-flex align-items-center gap-1.5" style={{ fontSize: '0.8rem' }}>
                    <i className="fas fa-history text-danger"></i> Recent Searches
                  </span>
                  <button
                    type="button"
                    className="btn btn-link text-muted p-0 text-decoration-none"
                    style={{ fontSize: '0.78rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRecentSearches();
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div className="d-flex flex-column gap-1.5">
                  {recentSearches.map((term, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center justify-content-between p-2 rounded-2 bg-light cursor-pointer"
                      style={{ fontSize: '0.88rem' }}
                      onClick={() => {
                        handleMobileSearchChange(term);
                        saveRecentSearch(term);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 text-dark">
                        <i className="fas fa-clock text-muted" style={{ fontSize: '0.8rem' }}></i>
                        <span>{term}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm text-muted p-0 border-0"
                        title="Remove from history"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(term);
                        }}
                      >
                        <i className="fas fa-times" style={{ fontSize: '0.8rem' }}></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white text-center">
                <small className="text-muted d-block mb-2">Popular Categories</small>
                <div className="d-flex flex-wrap justify-content-center gap-1.5">
                  {['Vegetables', 'Fruits', 'Biscuits', 'Chocolates', 'Spices'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className="btn btn-sm btn-light border rounded-pill px-2.5 py-1"
                      style={{ fontSize: '0.78rem' }}
                      onClick={() => {
                        handleMobileSearchChange(cat);
                        saveRecentSearch(cat);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      <div
        className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <a
          href="#"
          className={`mobile-menu-link ${currentView === 'home' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            navigateTo('home');
          }}
        >
          <i className="fas fa-home me-2" style={{ width: '22px', color: 'var(--primary-color)' }}></i> Home
        </a>
        <a
          href="#"
          className={`mobile-menu-link ${currentView === 'all-items' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            navigateTo('all-items');
          }}
        >
          <i className="fas fa-store me-2" style={{ width: '22px', color: 'var(--primary-color)' }}></i> All Products
        </a>
        <a
          href="#"
          className="mobile-menu-link"
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            setIsUserDrawerOpen(true);
          }}
        >
          <i className="fas fa-user-circle me-2" style={{ width: '22px', color: 'var(--primary-color)' }}></i> My Account & Orders
        </a>

        {/* Quick Category Shortcuts */}
        <div className="mobile-menu-category-section">
          <div className="mobile-menu-category-title">Shop by Category</div>
          <div className="mobile-menu-category-grid">
            <button
              type="button"
              className="mobile-category-chip"
              onClick={() => { setIsMobileMenuOpen(false); navigateTo('vegetables'); }}
            >
              🥦 Vegetables
            </button>
            <button
              type="button"
              className="mobile-category-chip"
              onClick={() => { setIsMobileMenuOpen(false); navigateTo('fruits'); }}
            >
              🍎 Fruits
            </button>
            <button
              type="button"
              className="mobile-category-chip"
              onClick={() => { setIsMobileMenuOpen(false); navigateTo('spices'); }}
            >
              🌶️ Spices
            </button>
            <button
              type="button"
              className="mobile-category-chip"
              onClick={() => { setIsMobileMenuOpen(false); navigateTo('biscuits'); }}
            >
              🍪 Biscuits
            </button>
            <button
              type="button"
              className="mobile-category-chip"
              onClick={() => { setIsMobileMenuOpen(false); navigateTo('chocolates'); }}
            >
              🍫 Chocolates
            </button>
          </div>
        </div>

        <a
          href="#"
          className="mobile-menu-link text-danger fw-bold"
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            openTrackOrderModal();
          }}
        >
          <i className="fas fa-truck-fast me-2 text-danger" style={{ width: '22px' }}></i> Track Order
        </a>
        <a
          href="#"
          className={`mobile-menu-link text-danger fw-bold ${currentView === 'admin' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            navigateTo('admin');
          }}
        >
          <i className="fas fa-user-shield me-2 text-danger" style={{ width: '22px' }}></i> Admin Panel
        </a>
        <a
          href="#"
          className={`mobile-menu-link ${currentView === 'contact' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            navigateTo('contact');
          }}
        >
          <i className="fas fa-envelope me-2" style={{ width: '22px', color: 'var(--primary-color)' }}></i> Contact Us
        </a>
        <a
          href="#"
          className="mobile-menu-link"
          onClick={(e) => {
            e.preventDefault();
            setIsMobileMenuOpen(false);
            navigateTo('home');
            setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}
        >
          <i className="fas fa-info-circle me-2" style={{ width: '22px', color: 'var(--primary-color)' }}></i> About Us
        </a>
        {isLoggedIn ? (
          <a
            href="#"
            className="mobile-menu-link text-danger fw-bold"
            onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
              logoutUser();
            }}
          >
            <i className="fas fa-sign-out-alt me-2" style={{ width: '22px' }}></i> Logout ({username})
          </a>
        ) : (
          <div className="mobile-auth-section border-top mt-2 pt-3">
            <div className="p-3 mb-3 bg-light rounded-3 border">
              <div className="fw-bold mb-1 text-dark small d-flex align-items-center justify-content-between">
                <span>Account Actions</span>
                <span className="badge bg-danger text-white rounded-pill px-2">New User?</span>
              </div>
              <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
                Join FastMart to track orders, save items & get exclusive deals!
              </p>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary flex-fill fw-bold rounded-pill py-2"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateTo('login', 'signin');
                  }}
                >
                  <i className="fas fa-sign-in-alt me-1"></i> Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger flex-fill fw-bold rounded-pill py-2 shadow-xs"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateTo('login', 'signup');
                  }}
                >
                  <i className="fas fa-user-plus me-1"></i> Register
                </button>
              </div>
            </div>

            <a
              href="#"
              className={`mobile-menu-link ${currentView === 'login' && authInitialMode === 'signin' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigateTo('login', 'signin');
              }}
            >
              <i className="fas fa-sign-in-alt me-2" style={{ width: '22px', color: 'var(--primary-color)' }}></i> Sign In
            </a>
            <a
              href="#"
              className={`mobile-menu-link text-danger fw-bold ${currentView === 'login' && authInitialMode === 'signup' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                navigateTo('login', 'signup');
              }}
            >
              <i className="fas fa-user-plus me-2 text-danger" style={{ width: '22px' }}></i> Create Account / Register
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};
