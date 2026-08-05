import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const OrderSuccessModal: React.FC = () => {
  const {
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    confirmedOrder,
    openTrackOrderModal,
  } = useApp();

  // Play audio chime when opened
  useEffect(() => {
    if (isSuccessModalOpen) {
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const playNote = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            gain.gain.setValueAtTime(0.25, ctx.currentTime + startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
          };
          playNote(523.25, 0, 0.22);
          playNote(659.25, 0.12, 0.22);
          playNote(784.00, 0.24, 0.45);
        }
      } catch (e) {
        console.log('Audio chime error:', e);
      }
    }
  }, [isSuccessModalOpen]);

  if (!isSuccessModalOpen || !confirmedOrder) return null;

  return (
    <div className="order-success-modal is-open" id="order-success-modal">
      <div className="order-success-content">
        <div className="success-icon-badge text-center my-2" style={{ fontSize: '3rem', color: '#2ecc71' }}>
          <i className="fas fa-check-circle"></i>
        </div>
        <h3 className="fw-bold m-0 text-center">Order Confirmed!</h3>
        <p className="text-muted small mt-1 mb-3 text-center">Thank you for shopping with FastMart.</p>

        <div className="order-details-card p-3 bg-light rounded mb-3 border">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted small">Order ID:</span>
            <strong className="text-danger small">{confirmedOrder.id}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted small">Customer Name:</span>
            <strong className="small">{confirmedOrder.customer}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted small">Payment Method:</span>
            <strong className="small">{confirmedOrder.paymentMethod}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small">Total Paid:</span>
            <strong className="fs-6 text-success">₹{confirmedOrder.total}</strong>
          </div>
          <div className="border-top pt-2">
            <span className="text-muted d-block small">Delivery Address:</span>
            <span className="fw-bold text-secondary small">{confirmedOrder.address}</span>
          </div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill flex-fill py-2 fw-bold"
            onClick={() => {
              setIsSuccessModalOpen(false);
              openTrackOrderModal(confirmedOrder.id);
            }}
          >
            <i className="fas fa-truck-fast me-1"></i> Track Live Order
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm rounded-pill flex-fill py-2 fw-bold"
            onClick={() => setIsSuccessModalOpen(false)}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
