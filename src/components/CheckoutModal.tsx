import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cart,
    clearCart,
    username,
    userPhone,
    userStreet,
    userCity,
    userPincode,
    saveAddressDetails,
    addOrder,
  } = useApp();

  const [name, setName] = useState(username);
  const [phone, setPhone] = useState(userPhone);
  const [address, setAddress] = useState(userStreet);
  const [city, setCity] = useState(userCity);
  const [pincode, setPincode] = useState(userPincode);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  useEffect(() => {
    setName(username);
    setPhone(userPhone);
    setAddress(userStreet);
    setCity(userCity);
    setPincode(userPincode);
  }, [username, userPhone, userStreet, userCity, userPincode, isCheckoutModalOpen]);

  if (!isCheckoutModalOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullAddress = `${address}, ${city} - ${pincode}`;

    saveAddressDetails({
      phone,
      street: address,
      city,
      pincode,
      fullAddress,
    });

    const itemSummary = cart.map(item => `${item.title} (${item.quantity})`).join(', ');

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customer: name || username || 'Customer',
      phone: phone,
      address: fullAddress,
      paymentMethod: paymentMethod,
      items: itemSummary,
      total: totalAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    addOrder(newOrder);
    clearCart();
    setIsCheckoutModalOpen(false);
  };

  return (
    <div className="checkout-modal is-open" id="checkout-modal">
      <div className="checkout-modal-content">
        <div className="checkout-modal-header">
          <div className="d-flex align-items-center gap-2">
            <i className="fas fa-truck text-danger fs-4"></i>
            <h4>Delivery & Payment Details</h4>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={() => setIsCheckoutModalOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="checkout-modal-body">
          <form onSubmit={handleSubmit}>
            <h6 className="fw-bold mb-2 text-danger">
              <i className="fas fa-user me-1"></i> Contact Information
            </h6>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  className="form-control form-control-sm"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <h6 className="fw-bold mb-2 text-danger">
              <i className="fas fa-map-marker-alt me-1"></i> Shipping Address
            </h6>
            <div className="mb-2">
              <label className="form-label small fw-bold mb-1">Street Address / House No. *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Flat No, Building, Street Name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label small fw-bold mb-1">City *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold mb-1">Pincode *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
            </div>

            <h6 className="fw-bold mb-2 text-danger">
              <i className="fas fa-wallet me-1"></i> Payment Method
            </h6>
            <div className="payment-methods-grid mb-3">
              {[
                { id: 'pay-cod', val: 'Cash on Delivery', icon: 'fas fa-money-bill-wave text-success', label: 'Cash on Delivery' },
                { id: 'pay-upi', val: 'UPI / Google Pay', icon: 'fas fa-mobile-alt text-primary', label: 'UPI / GPay / PhonePe' },
                { id: 'pay-card', val: 'Credit / Debit Card', icon: 'fas fa-credit-card text-warning', label: 'Card Payment' },
                { id: 'pay-netbank', val: 'Net Banking', icon: 'fas fa-university text-info', label: 'Net Banking' },
              ].map((opt) => (
                <div key={opt.id} className="payment-option-card">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id={opt.id}
                    value={opt.val}
                    checked={paymentMethod === opt.val}
                    onChange={() => setPaymentMethod(opt.val)}
                  />
                  <label htmlFor={opt.id} className="payment-option-label">
                    <i className={`${opt.icon} fs-5`}></i>
                    <span>{opt.label}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="checkout-summary-box mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1 small">
                <span className="text-muted">Item Subtotal:</span>
                <span className="fw-bold">₹{totalAmount}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1 small">
                <span className="text-muted">Delivery Charges:</span>
                <span className="text-success fw-bold">FREE</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center fw-bold fs-6">
                <span>Total Amount:</span>
                <span className="text-danger fs-5">₹{totalAmount}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-danger w-100 py-2 rounded-pill fw-bold shadow-sm">
              <i className="fas fa-check-circle me-1"></i> Place Order Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
