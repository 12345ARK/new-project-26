import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { navigateTo, setIsUserDrawerOpen, openTrackOrderModal } = useApp();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>FastMart</h4>
            <p>Your premium shopping destination for fresh groceries, organic items, and more.</p>
            <p style={{ fontFamily: 'cursive', marginTop: '10px' }}>𒆜𝓐𝓻𝓴𒆜</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>
                  Home
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('all-items'); }}>
                  Products
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                  About
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }}>
                  Feedback & Support
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); openTrackOrderModal(); }}>
                  <i className="fas fa-truck-fast me-1 text-danger"></i> Track Live Order
                </a>
              </li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Returns</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>FAQ</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Support</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fab fa-facebook"></i></a>
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fab fa-twitter"></i></a>
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fab fa-instagram"></i></a>
              <a href="#" onClick={(e) => e.preventDefault()}><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 FastMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
