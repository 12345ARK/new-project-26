import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FeedbackItem } from '../types';

export const ContactPage: React.FC = () => {
  const { addFeedback, username, userEmail, userPhone, isLoggedIn } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<FeedbackItem['category']>('Product Quality');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-fill logged-in user credentials
  useEffect(() => {
    if (isLoggedIn) {
      if (username) setName(username);
      if (userEmail) setEmail(userEmail);
      if (userPhone) setPhone(userPhone);
    }
  }, [isLoggedIn, username, userEmail, userPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    addFeedback({
      name: name.trim() || 'Anonymous Customer',
      email: email.trim() || 'not-provided@example.com',
      phone: phone.trim() || undefined,
      category,
      rating,
      message: message.trim(),
    });

    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setMessage('');
    setRating(5);
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return '⭐ 5/5 - Outstanding Experience!';
      case 4:
        return '⭐ 4/5 - Very Good Service';
      case 3:
        return '⭐ 3/5 - Average / Okay';
      case 2:
        return '⭐ 2/5 - Needs Improvement';
      case 1:
        return '⭐ 1/5 - Unsatisfactory';
      default:
        return '';
    }
  };

  return (
    <div className="feedback-page-container">
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header Section */}
        <div className="text-center mb-5">
          <span className="feedback-header-badge mb-2">
            <i className="fas fa-heart-pulse"></i> FastMart Voice
          </span>
          <h2 className="fw-extrabold text-dark display-6 mb-2">Customer Feedback & Support</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '640px', fontSize: '1.05rem' }}>
            Your ratings and suggestions go <strong>directly to the FastMart Admin Panel</strong>. Help us improve our store products, packaging, and lightning-fast delivery!
          </p>
        </div>

        <div className="row g-4">
          {/* Main Feedback Form Pane - Share Your Thoughts */}
          <div className="col-12 col-lg-7">
            <div className="feedback-form-card">
              {isSubmitted ? (
                <div className="text-center py-5">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-lg" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-check-circle fs-1"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-2">Feedback Received!</h3>
                  <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '440px' }}>
                    Thank you, <strong>{name}</strong>. Your feedback has been sent straight to the store admin dashboard for active review.
                  </p>

                  <div className="p-3 bg-light rounded-3 text-start mb-4 border">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-danger text-white">{category}</span>
                      <span className="fw-bold text-warning">{'★'.repeat(rating)}</span>
                    </div>
                    <p className="small text-dark mb-0 italic">"{message}"</p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold"
                    onClick={handleResetForm}
                  >
                    <i className="fas fa-pen-to-square me-2"></i> Submit Another Feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h4 className="feedback-card-title">
                    <i className="fas fa-comment-dots"></i> Share Your Thoughts
                  </h4>

                  {/* Rating Selector */}
                  <div className="rating-picker-container">
                    <label className="form-label fw-bold small text-uppercase text-muted mb-2 d-block">
                      1. How would you rate your overall experience?
                    </label>
                    <div className="rating-stars-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="rating-star-btn"
                          style={{
                            color: star <= (hoverRating || rating) ? '#f59e0b' : '#cbd5e1',
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <small className="fw-bold text-dark d-block">
                      {getRatingLabel(hoverRating || rating)}
                    </small>
                  </div>

                  {/* Feedback Category */}
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-uppercase text-muted mb-2 d-block">
                      2. Select Feedback Category
                    </label>
                    <div className="category-grid">
                      {[
                        { label: 'Product Quality', icon: 'fa-apple-whole' },
                        { label: 'Delivery Experience', icon: 'fa-truck-fast' },
                        { label: 'App / Website', icon: 'fa-mobile-screen' },
                        { label: 'Customer Support', icon: 'fa-headset' },
                        { label: 'General Suggestion', icon: 'fa-lightbulb' },
                      ].map((cat) => (
                        <button
                          key={cat.label}
                          type="button"
                          className={`category-pill-btn ${category === cat.label ? 'active' : ''}`}
                          onClick={() => setCategory(cat.label as FeedbackItem['category'])}
                        >
                          <i className={`fas ${cat.icon}`}></i>
                          <span className="text-truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Your Name *</label>
                      <input
                        type="text"
                        className="feedback-input-field"
                        placeholder="e.g. Aryan kr."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Email Address *</label>
                      <input
                        type="email"
                        className="feedback-input-field"
                        placeholder="aryan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className="feedback-input-field"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Message Input */}
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted">Your Feedback / Review *</label>
                    <textarea
                      rows={5}
                      className="feedback-input-field"
                      placeholder="Please share specific details about your experience or suggestion..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="feedback-submit-btn"
                  >
                    <i className="fas fa-paper-plane"></i> Submit Feedback 
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Side Info & Admin Escalation Pane */}
          <div className="col-12 col-lg-5">
            <div className="admin-escalation-card mb-4">
              <i className="fas fa-shield-halved bg-icon"></i>

              <span className="admin-badge-status">
                ⚡Fastmart Admin Connected
              </span>

              <h4>Direct Admin Escalation</h4>
              <p className="description">
                At FastMart, every piece of customer feedback is logged straight into our Store Management Portal. Our team reviews entries daily to optimize item quality and resolve delivery inquiries.
              </p>

              <div className="mb-4">
                <div className="admin-contact-row">
                  <div className="admin-contact-icon">
                    <i className="fas fa-headset"></i>
                  </div>
                  <div>
                    <span className="admin-contact-label">Customer Helpline</span>
                    <span className="admin-contact-value">+91 98765 43210</span>
                  </div>
                </div>

                <div className="admin-contact-row">
                  <div className="admin-contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <span className="admin-contact-label">Email Support</span>
                    <span className="admin-contact-value">support@fastmart.com</span>
                  </div>
                </div>

                <div className="admin-contact-row">
                  <div className="admin-contact-icon">
                    <i className="fas fa-location-dot"></i>
                  </div>
                  <div>
                    <span className="admin-contact-label">Store Headquarters</span>
                    <span className="admin-contact-value">Sector 62, Patna, India</span>
                  </div>
                </div>
              </div>

              <hr className="border-secondary opacity-25 my-3" />

              <div className="d-flex align-items-center justify-content-between text-white-50 small">
                <span><i className="fas fa-clock text-danger me-1"></i> Business Hours</span>
                <strong className="text-white">Mon - Sat: 8 AM - 9 PM</strong>
              </div>
            </div>

            {/* Satisfaction Guarantee Badge */}
            <div className="quality-guarantee-card">
              <div className="d-flex align-items-start gap-3">
                <div className="bg-danger bg-opacity-10 text-danger p-2.5 rounded-3">
                  <i className="fas fa-thumbs-up fs-4"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">100% Quality Assurance</h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.85rem' }}>
                    If you receive any damaged or non-fresh groceries, submit a feedback above or contact support for an instant replacement or refund credit!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

