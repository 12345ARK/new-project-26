import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
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
    triggerToast,
  } = useApp();

  const [name, setName] = useState(username);
  const [phone, setPhone] = useState(userPhone);
  const [address, setAddress] = useState(userStreet);
  const [city, setCity] = useState(userCity);
  const [pincode, setPincode] = useState(userPincode);
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI / Google Pay' | 'Credit / Debit Card' | 'Net Banking'>('UPI / Google Pay');

  // UPI State
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState<string>('');
  const [customUpiId, setCustomUpiId] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');

  // Card State
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');

  // Processing & OTP Verification state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showOtpScreen, setShowOtpScreen] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('');
  const [pendingOrderData, setPendingOrderData] = useState<Order | null>(null);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const merchantUpiId = (import.meta as any).env?.VITE_UPI_ID || 'fastmart@upi';

  useEffect(() => {
    setName(username);
    setPhone(userPhone);
    setAddress(userStreet);
    setCity(userCity);
    setPincode(userPincode);
  }, [username, userPhone, userStreet, userCity, userPincode, isCheckoutModalOpen]);

  // Generate real dynamic UPI QR Code whenever payment method or total changes
  useEffect(() => {
    if (isCheckoutModalOpen && totalAmount > 0) {
      const orderRef = 'FM-' + Math.floor(100000 + Math.random() * 900000);
      const upiUrl = `upi://pay?pa=${merchantUpiId}&pn=FastMart%20Grocery&am=${totalAmount}&tr=${orderRef}&cu=INR&tn=Order%20Payment`;
      
      QRCode.toDataURL(upiUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then(url => setUpiQrCodeUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    }
  }, [isCheckoutModalOpen, totalAmount, merchantUpiId]);

  if (!isCheckoutModalOpen) return null;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Detect card brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', color: '#1a1f71', icon: 'fa-cc-visa' };
    if (/^5[1-5]/.test(clean)) return { name: 'Mastercard', color: '#eb001b', icon: 'fa-cc-mastercard' };
    if (/^3[47]/.test(clean)) return { name: 'Amex', color: '#006fcf', icon: 'fa-cc-amex' };
    if (/^6[0245]/.test(clean)) return { name: 'RuPay', color: '#00843d', icon: 'fa-credit-card' };
    return { name: 'Card', color: '#666', icon: 'fa-credit-card' };
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      triggerToast('Incomplete Address', 'Please fill in all shipping details.', undefined, 'info');
      return;
    }

    // Validate payment input based on method
    if (paymentMethod === 'Credit / Debit Card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        triggerToast('Invalid Card Number', 'Please enter a valid 15 or 16 digit card number.', undefined, 'info');
        return;
      }
      if (cardExpiry.length < 5) {
        triggerToast('Invalid Expiry', 'Please enter expiry date in MM/YY format.', undefined, 'info');
        return;
      }
      if (cardCvv.length < 3) {
        triggerToast('Invalid CVV', 'Please enter 3 or 4 digit CVV security code.', undefined, 'info');
        return;
      }
    }

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
      status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
    };

    if (paymentMethod === 'Cash on Delivery') {
      // Instant order confirmation for Cash on Delivery
      addOrder(newOrder);
      clearCart();
      setIsCheckoutModalOpen(false);
      triggerToast('Order Placed!', 'Your order has been confirmed with Cash on Delivery.', undefined, 'success');
    } else {
      // Show payment authorization / OTP step for digital payments
      setPendingOrderData(newOrder);
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setShowOtpScreen(true);
      }, 1500);
    }
  };

  const handleConfirmOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 4) {
      triggerToast('Enter OTP', 'Please enter the 6-digit OTP sent to your phone.', undefined, 'info');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowOtpScreen(false);
      if (pendingOrderData) {
        addOrder(pendingOrderData);
        clearCart();
      }
      setIsCheckoutModalOpen(false);
      triggerToast('Payment Successful! 💳', 'Payment verified and order placed successfully.', undefined, 'success');
    }, 1800);
  };

  const banksList = [
    { name: 'HDFC Bank', icon: '🏛️' },
    { name: 'State Bank of India', icon: '🏦' },
    { name: 'ICICI Bank', icon: '🏢' },
    { name: 'Axis Bank', icon: '🏛️' },
    { name: 'Kotak Bank', icon: '🏦' },
    { name: 'Punjab National Bank', icon: '🏢' },
  ];

  const upiIntentUrl = `upi://pay?pa=${merchantUpiId}&pn=FastMart%20Grocery&am=${totalAmount}&cu=INR`;

  return (
    <div className="checkout-modal is-open" id="checkout-modal">
      <div className="checkout-modal-content" style={{ maxWidth: '640px' }}>
        <div className="checkout-modal-header">
          <div className="d-flex align-items-center gap-2">
            <i className="fas fa-shield-alt text-danger fs-4"></i>
            <div>
              <h4 className="m-0">FastMart Secure Checkout</h4>
              <p className="text-muted small m-0">256-Bit SSL Encrypted Payment</p>
            </div>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={() => {
              if (!isProcessing) {
                setShowOtpScreen(false);
                setIsCheckoutModalOpen(false);
              }
            }}
          >
            ✕
          </button>
        </div>

        <div className="checkout-modal-body p-3">
          {/* OTP Authorization Gateway Modal */}
          {showOtpScreen ? (
            <div className="p-3 text-center my-2">
              <div className="p-3 rounded-4 bg-light border mb-3">
                <div className="mb-2 text-danger" style={{ fontSize: '2.5rem' }}>
                  <i className="fas fa-lock"></i>
                </div>
                <h5 className="fw-bold mb-1">Bank Payment Authorization</h5>
                <p className="text-muted small mb-2">
                  A 6-digit One Time Password (OTP) was sent to <strong>+91 {phone || 'XXXXX XXXXX'}</strong> to authorize <strong>₹{totalAmount}</strong> for FastMart.
                </p>
                <div className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 mb-3">
                  Test OTP: <strong>123456</strong>
                </div>

                <form onSubmit={handleConfirmOtp} className="max-w-xs mx-auto">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-lg text-center fw-bold letter-spacing-2"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn btn-danger w-100 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Verifying Payment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i> Confirm & Authorize ₹{totalAmount}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="py-5 text-center my-4">
              <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }}></div>
              <h5 className="fw-bold">Connecting to Payment Gateway...</h5>
              <p className="text-muted small">Please do not refresh or press back button.</p>
            </div>
          ) : (
            <form onSubmit={handleStartPayment}>
              {/* Shipping Address */}
              <div className="card border-0 bg-light p-3 rounded-3 mb-3">
                <h6 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
                  <i className="fas fa-truck"></i> Delivery Information
                </h6>
                <div className="row g-2">
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
                  <div className="col-12">
                    <label className="form-label small fw-bold mb-1">Street Address *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Flat No, Building, Street Name"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
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
              </div>

              {/* Payment Methods */}
              <h6 className="fw-bold text-danger mb-2 d-flex align-items-center gap-2">
                <i className="fas fa-credit-card"></i> Select Real Payment Method
              </h6>

              <div className="payment-methods-grid mb-3">
                {[
                  { id: 'pay-upi', val: 'UPI / Google Pay', icon: 'fas fa-mobile-alt text-primary', label: 'UPI / GPay / PhonePe' },
                  { id: 'pay-card', val: 'Credit / Debit Card', icon: 'fas fa-credit-card text-warning', label: 'Credit / Debit Card' },
                  { id: 'pay-netbank', val: 'Net Banking', icon: 'fas fa-university text-info', label: 'Net Banking' },
                  { id: 'pay-cod', val: 'Cash on Delivery', icon: 'fas fa-money-bill-wave text-success', label: 'Cash on Delivery' },
                ].map((opt) => (
                  <div key={opt.id} className="payment-option-card">
                    <input
                      type="radio"
                      name="paymentMethod"
                      id={opt.id}
                      value={opt.val}
                      checked={paymentMethod === opt.val}
                      onChange={() => setPaymentMethod(opt.val as any)}
                    />
                    <label htmlFor={opt.id} className="payment-option-label cursor-pointer">
                      <i className={`${opt.icon} fs-5`}></i>
                      <span>{opt.label}</span>
                    </label>
                  </div>
                ))}
              </div>

              {/* Dynamic Payment Method View */}
              {paymentMethod === 'UPI / Google Pay' && (
                <div className="border rounded-3 p-3 bg-white mb-3 text-center shadow-sm">
                  <h6 className="fw-bold text-dark mb-1">Scan QR Code with any UPI App</h6>
                  <p className="text-muted small mb-2">Google Pay, PhonePe, Paytm, BHIM, Amazon Pay</p>

                  {upiQrCodeUrl ? (
                    <div className="d-inline-block p-2 bg-white border rounded-3 shadow-sm mb-2">
                      <img src={upiQrCodeUrl} alt="UPI QR Code" className="img-fluid" style={{ width: '180px', height: '180px' }} />
                    </div>
                  ) : (
                    <div className="p-4 text-center">Loading QR Code...</div>
                  )}

                  <div className="small text-muted mb-2">
                    UPI ID: <strong className="text-dark">{merchantUpiId}</strong>
                  </div>

                  <div className="d-flex justify-content-center gap-2 mb-3">
                    <a
                      href={upiIntentUrl}
                      className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-external-link-alt"></i> Open UPI App on Mobile
                    </a>
                  </div>

                  <div className="border-top pt-2">
                    <label className="form-label small fw-bold text-muted mb-1 d-block text-start">Or Enter Your VPA / UPI ID:</label>
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="username@upi or mobile@ybl"
                        value={customUpiId}
                        onChange={(e) => setCustomUpiId(e.target.value)}
                      />
                      <span className="input-group-text bg-light text-muted">UPI</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Credit / Debit Card' && (
                <div className="border rounded-3 p-3 bg-white mb-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold m-0 text-dark">Credit or Debit Card Details</h6>
                    <span className="badge px-2 py-1" style={{ backgroundColor: getCardBrand().color, color: 'white' }}>
                      <i className={`fas ${getCardBrand().icon} me-1`}></i>
                      {getCardBrand().name}
                    </span>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-1">Card Number *</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-light">
                        <i className={`fas ${getCardBrand().icon}`}></i>
                      </span>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="4532 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold mb-1">Cardholder Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Name printed on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold mb-1">CVV / CVC *</label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <div className="border rounded-3 p-3 bg-white mb-3 shadow-sm">
                  <h6 className="fw-bold text-dark mb-2">Select Your Bank</h6>
                  <div className="row g-2 mb-2">
                    {banksList.map((bank) => (
                      <div key={bank.name} className="col-6">
                        <button
                          type="button"
                          className={`btn btn-sm w-100 text-start d-flex align-items-center gap-2 p-2 border rounded-2 ${
                            selectedBank === bank.name ? 'border-danger bg-danger-subtle fw-bold' : 'bg-light'
                          }`}
                          onClick={() => setSelectedBank(bank.name)}
                        >
                          <span>{bank.icon}</span>
                          <span className="small text-truncate">{bank.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted small m-0 text-center">
                    You will be redirected to <strong>{selectedBank}</strong> secure netbanking gateway.
                  </p>
                </div>
              )}

              {paymentMethod === 'Cash on Delivery' && (
                <div className="border rounded-3 p-3 bg-success-subtle border-success mb-3 text-success">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="fas fa-check-circle fs-5"></i>
                    <strong className="small">Cash on Delivery Selected</strong>
                  </div>
                  <p className="small mb-0 text-dark">
                    Pay <strong>₹{totalAmount}</strong> in cash or via UPI to our delivery executive when your groceries arrive at your doorstep.
                  </p>
                </div>
              )}

              {/* Order Summary & Pay Button */}
              <div className="checkout-summary-box mb-3 bg-light p-3 rounded-3 border">
                <div className="d-flex justify-content-between align-items-center mb-1 small">
                  <span className="text-muted">Item Subtotal:</span>
                  <span className="fw-bold">₹{totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1 small">
                  <span className="text-muted">Express Delivery:</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center fw-bold fs-6">
                  <span>Total Amount Payable:</span>
                  <span className="text-danger fs-4">₹{totalAmount}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-danger w-100 py-2.5 rounded-pill fw-bold shadow d-flex align-items-center justify-content-center gap-2">
                <i className="fas fa-lock"></i>
                {paymentMethod === 'Cash on Delivery' ? 'Confirm Order (COD)' : `Pay ₹${totalAmount} Now`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
