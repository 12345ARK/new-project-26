import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const TrackOrderModal: React.FC = () => {
  const {
    isTrackModalOpen,
    closeTrackOrderModal,
    trackingOrderId,
    orders,
    updateOrderStatus,
    navigateTo,
    triggerToast,
    isLoggedIn,
    username,
    isAdminAuthenticated,
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(trackingOrderId);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Ordered items by mistake');
  const [cancelComments, setCancelComments] = useState<string>('');

  // Sync active order when modal opens or trackingOrderId changes
  useEffect(() => {
    if (trackingOrderId) {
      setActiveOrderId(trackingOrderId);
      setSearchInput(trackingOrderId);
    } else if (orders.length > 0) {
      setActiveOrderId(orders[0].id);
      setSearchInput(orders[0].id);
    } else {
      setActiveOrderId(null);
      setSearchInput('');
    }
  }, [trackingOrderId, isTrackModalOpen, orders]);

  if (!isTrackModalOpen) return null;

  // Find target order
  const currentOrder = orders.find(
    (o) => o.id.toLowerCase() === (activeOrderId || '').toLowerCase() || o.id.toLowerCase() === searchInput.trim().toLowerCase()
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const match = orders.find((o) => o.id.toLowerCase() === searchInput.trim().toLowerCase());
    if (match) {
      setActiveOrderId(match.id);
    } else {
      setActiveOrderId(searchInput.trim());
    }
  };

  const isDeliveredStatus = (status: string) => {
    const norm = status.toLowerCase();
    return norm === 'delivered' || (norm.includes('deliver') && !norm.includes('out'));
  };

  const isOutForDeliveryStatus = (status: string) => {
    const norm = status.toLowerCase();
    return norm.includes('out') || norm.includes('way');
  };

  const isPackedStatus = (status: string) => {
    const norm = status.toLowerCase();
    return norm.includes('ship') || norm.includes('pack');
  };

  const isCancelledStatus = (status: string) => {
    const norm = status.toLowerCase();
    return norm.includes('cancel');
  };

  const getStepProgressPercentage = (status: string) => {
    if (isCancelledStatus(status)) return 0;
    if (isDeliveredStatus(status)) return 100;
    if (isOutForDeliveryStatus(status)) return 72;
    if (isPackedStatus(status)) return 42;
    return 14;
  };

  const getStepStageInfo = (status: string) => {
    if (isCancelledStatus(status)) {
      return {
        title: 'Order Cancelled',
        desc: 'This order was cancelled and will not be delivered.',
        color: 'danger',
        eta: 'N/A',
      };
    }
    if (isDeliveredStatus(status)) {
      return {
        title: 'Delivered Successfully!',
        desc: 'Items handed over at your doorstep.',
        color: 'success',
        eta: 'Delivered',
      };
    }
    if (isOutForDeliveryStatus(status)) {
      return {
        title: 'Out for Delivery',
        desc: 'FastMart rider is on the way to your location.',
        color: 'primary',
        eta: '5-10 Mins',
      };
    }
    if (isPackedStatus(status)) {
      return {
        title: 'Packed & Dispatched',
        desc: 'Your groceries are packed in temperature-controlled bags.',
        color: 'info',
        eta: '10-15 Mins',
      };
    }
    return {
      title: 'Order Processing',
      desc: 'Order received & sent to FastMart Patna store team.',
      color: 'warning',
      eta: '12-18 Mins',
    };
  };

  const handleCancelOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    const fullReason = cancelReason === 'Other' && cancelComments.trim() ? `Other: ${cancelComments.trim()}` : cancelReason;
    updateOrderStatus(currentOrder.id, 'Cancelled');
    setShowCancelDialog(false);
    triggerToast(
      'Order Cancelled 🚫',
      `Order #${currentOrder.id} has been cancelled (${fullReason}). Refund will be processed shortly.`,
      undefined,
      'info'
    );
  };

  // User recent orders list
  const userRecentOrders = orders.filter(
    (o) => !isLoggedIn || o.customer.toLowerCase() === username.toLowerCase() || username === 'Admin' || username === 'Guest Customer'
  );

  // Stepper definition
  const stepperSteps = [
    {
      key: 'processing',
      label: 'Processing',
      sublabel: 'Order Confirmed',
      icon: 'fa-receipt',
      isReached: (s: string) => !isCancelledStatus(s),
      isCurrent: (s: string) => !isCancelledStatus(s) && !isPackedStatus(s) && !isOutForDeliveryStatus(s) && !isDeliveredStatus(s),
      isCompleted: (s: string) => isPackedStatus(s) || isOutForDeliveryStatus(s) || isDeliveredStatus(s),
    },
    {
      key: 'packed',
      label: 'Packed',
      sublabel: 'Dispatched',
      icon: 'fa-box-open',
      isReached: (s: string) => isPackedStatus(s) || isOutForDeliveryStatus(s) || isDeliveredStatus(s),
      isCurrent: (s: string) => isPackedStatus(s),
      isCompleted: (s: string) => isOutForDeliveryStatus(s) || isDeliveredStatus(s),
    },
    {
      key: 'out',
      label: 'Out for Delivery',
      sublabel: 'On the Way',
      icon: 'fa-truck-fast',
      isReached: (s: string) => isOutForDeliveryStatus(s) || isDeliveredStatus(s),
      isCurrent: (s: string) => isOutForDeliveryStatus(s),
      isCompleted: (s: string) => isDeliveredStatus(s),
    },
    {
      key: 'delivered',
      label: 'Delivered',
      sublabel: 'At Doorstep',
      icon: 'fa-house-chimney-check',
      isReached: (s: string) => isDeliveredStatus(s),
      isCurrent: (s: string) => isDeliveredStatus(s),
      isCompleted: (s: string) => isDeliveredStatus(s),
    }
  ];

  const currentStage = currentOrder ? getStepStageInfo(currentOrder.status) : null;

  return (
    <div className="track-order-modal-overlay" onClick={closeTrackOrderModal}>
      <div
        className="track-order-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="track-modal-header d-flex align-items-center justify-content-between p-3.5 p-md-4 border-bottom bg-white rounded-top-4">
          <div className="d-flex align-items-center gap-2.5">
            <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
              <i className="fas fa-truck-fast fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2" style={{ fontSize: '1.15rem' }}>
                Live Order Tracker
              </h5>
              <small className="text-muted" style={{ fontSize: '0.78rem' }}>FastMart Express 10-Min Delivery</small>
            </div>
          </div>
          <button
            type="button"
            className="btn-close rounded-circle p-2 bg-light shadow-none"
            onClick={closeTrackOrderModal}
            aria-label="Close"
          ></button>
        </div>

        {/* Modal Body */}
        <div className="track-modal-body p-3.5 p-md-4 overflow-y-auto" style={{ maxHeight: '82vh' }}>
          {/* Search Order ID Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-white border-0 ps-3">
                <i className="fas fa-barcode text-danger"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 py-2.5 px-2 shadow-none text-dark fw-bold"
                placeholder="Enter Order ID (e.g. FM-104921)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-danger px-4 fw-bold rounded-pill my-1 me-1">
                Track
              </button>
            </div>
          </form>

          {/* Quick Select Buttons for Recent Orders */}
          {userRecentOrders.length > 0 && (
            <div className="mb-4">
              <small className="text-uppercase fw-bold text-muted d-block mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                Quick Select Recent Order:
              </small>
              <div className="d-flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                {userRecentOrders.slice(0, 5).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-bold transition-all ${
                      currentOrder?.id === ord.id
                        ? 'btn-danger shadow-sm'
                        : 'btn-outline-secondary border-opacity-25 bg-white text-dark'
                    }`}
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => {
                      setActiveOrderId(ord.id);
                      setSearchInput(ord.id);
                    }}
                  >
                    #{ord.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* If Order Found */}
          {currentOrder ? (
            <div className="w-100">
              {/* Order Overview Header Card */}
              <div className="card w-100 border-0 shadow-sm rounded-4 p-3.5 mb-4 bg-light border">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div>
                    <span className="text-uppercase fw-bold text-muted d-block" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>Tracking Order</span>
                    <h4 className="fw-extrabold text-dark m-0 font-monospace" style={{ fontSize: '1.25rem' }}>
                      #{currentOrder.id}
                    </h4>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge rounded-pill px-3 py-1.5 fw-bold fs-6 d-inline-flex align-items-center gap-1.5 shadow-sm ${
                        currentOrder.status === 'Delivered' ? 'bg-success text-white' :
                        currentOrder.status === 'Out for Delivery' ? 'bg-primary text-white' :
                        currentOrder.status === 'Shipped' || currentOrder.status === 'Packed' ? 'bg-info text-white' :
                        currentOrder.status === 'Cancelled' ? 'bg-danger text-white' : 'bg-warning text-dark'
                      }`}
                    >
                      <i className={
                        currentOrder.status === 'Delivered' ? 'fas fa-check-circle' :
                        currentOrder.status === 'Out for Delivery' ? 'fas fa-truck-fast' :
                        currentOrder.status === 'Shipped' || currentOrder.status === 'Packed' ? 'fas fa-box-open' :
                        currentOrder.status === 'Cancelled' ? 'fas fa-ban' : 'fas fa-clock'
                      }></i>
                      {currentOrder.status}
                    </span>
                  </div>
                </div>

                <div className="row w-100 mx-0 g-2 mt-2 pt-2 border-top border-secondary border-opacity-10 small">
                  <div className="col-6 col-sm-3 px-1 mb-2 mb-sm-0">
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Order Date</span>
                    <strong className="text-dark d-block">{currentOrder.date}</strong>
                  </div>
                  <div className="col-6 col-sm-3 px-1 mb-2 mb-sm-0">
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Total Bill</span>
                    <strong className="text-danger fw-bold d-block">₹{currentOrder.total}</strong>
                  </div>
                  <div className="col-6 col-sm-3 px-1">
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Payment</span>
                    <strong className="text-dark d-block text-truncate">{currentOrder.paymentMethod}</strong>
                  </div>
                  <div className="col-6 col-sm-3 px-1">
                    <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Estimated Arrival</span>
                    <strong className="text-success fw-bold d-block">
                      {currentStage?.eta}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Enhanced Visual Progress Stepper */}
              {currentOrder.status !== 'Cancelled' ? (
                <div className="card w-100 border-0 shadow-sm rounded-4 p-3.5 p-md-4 mb-4 bg-white border">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="fw-extrabold text-dark m-0 d-flex align-items-center gap-2">
                      <i className="fas fa-route text-danger"></i> Order Stage Progress
                    </h6>
                    <span className="badge bg-danger bg-opacity-10 text-danger fw-bold rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                      Live Status
                    </span>
                  </div>

                  {/* Visual Stepper Container */}
                  <div className="stepper-visual-wrapper w-100 mb-4 px-1 px-sm-2">
                    {/* Connecting Line Track */}
                    <div className="stepper-line-back">
                      <div
                        className="stepper-line-fill"
                        style={{ width: `${getStepProgressPercentage(currentOrder.status)}%` }}
                      ></div>
                    </div>

                    {/* Stepper Nodes */}
                    <div className="d-flex justify-content-between position-relative z-1 w-100">
                      {stepperSteps.map((step, idx) => {
                        const isDone = step.isCompleted(currentOrder.status);
                        const isCurrent = step.isCurrent(currentOrder.status);
                        const isReached = step.isReached(currentOrder.status);

                        return (
                          <div key={step.key} className="stepper-node-item text-center">
                            {/* Circle Icon Badge */}
                            <div
                              className={`stepper-circle-badge ${
                                isDone
                                  ? 'completed'
                                  : isCurrent
                                  ? 'active'
                                  : isReached
                                  ? 'reached'
                                  : 'upcoming'
                              }`}
                            >
                              {isDone ? (
                                <i className="fas fa-check"></i>
                              ) : isCurrent ? (
                                <i className={`fas ${step.icon} fa-bounce`}></i>
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>

                            {/* Label */}
                            <div className="mt-2">
                              <span
                                className={`d-block fw-bold stepper-title-text ${
                                  isCurrent ? 'text-danger' : isDone ? 'text-dark' : 'text-muted'
                                }`}
                              >
                                {step.label}
                              </span>
                              <small className="text-muted d-none d-sm-block stepper-subtitle-text">
                                {step.sublabel}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Stage Detail Banner */}
                  {currentStage && (
                    <div className={`p-3 rounded-3 bg-${currentStage.color} bg-opacity-10 border border-${currentStage.color} border-opacity-25 d-flex align-items-center gap-3`}>
                      <div className={`bg-${currentStage.color} text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '38px', height: '38px' }}>
                        <i className={`fas ${
                          currentStage.color === 'success' ? 'fa-check-double' :
                          currentStage.color === 'primary' ? 'fa-motorcycle' :
                          currentStage.color === 'info' ? 'fa-boxes-packing' : 'fa-hourglass-half'
                        }`}></i>
                      </div>
                      <div>
                        <strong className={`d-block text-${currentStage.color}`} style={{ fontSize: '0.9rem' }}>
                          {currentStage.title}
                        </strong>
                        <span className="text-dark small opacity-75">{currentStage.desc}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-danger rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
                  <i className="fas fa-exclamation-triangle fs-3"></i>
                  <div>
                    <strong className="d-block">This order was cancelled</strong>
                    <span className="small">If you paid online, your refund will be processed within 24-48 hours.</span>
                  </div>
                </div>
              )}

              {/* Admin-only extended order details (Rider, Status Simulator, Items & Address) */}
              {isAdminAuthenticated && (
                <>
                  {/* Delivery Partner Details (Active if Out for Delivery or Shipped) */}
                  {(currentOrder.status === 'Out for Delivery' || currentOrder.status === 'Shipped' || currentOrder.status === 'Packed') && (
                    <div className="card w-100 border-0 shadow-sm rounded-4 p-3.5 mb-4 bg-dark text-white position-relative overflow-hidden">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '44px', height: '44px' }}>
                            <i className="fas fa-motorcycle fs-5"></i>
                          </div>
                          <div>
                            <span className="text-white-50 text-uppercase fw-bold d-block" style={{ fontSize: '0.68rem' }}>Assigned Delivery Rider</span>
                            <strong className="text-white fs-6 d-block">Rahul Verma (FastMart Agent)</strong>
                            <div className="d-flex flex-wrap align-items-center gap-2 mt-0.5">
                              <span className="badge bg-success text-white" style={{ fontSize: '0.65rem' }}>★ 4.9 Rating</span>
                              <span className="text-white-50 small" style={{ fontSize: '0.75rem' }}>BR-01-8821</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-start text-sm-end">
                          <span className="text-white-50 text-uppercase fw-bold d-block" style={{ fontSize: '0.68rem' }}>Delivery OTP</span>
                          <span className="badge bg-warning text-dark font-monospace fs-6 px-2.5 py-1">4829</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Quick Status Update Simulator */}
                  <div className="p-3 bg-light rounded-4 border mb-4 w-100">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <small className="fw-bold text-muted text-uppercase d-block" style={{ fontSize: '0.7rem' }}>
                        <i className="fas fa-sliders text-danger me-1"></i> Admin Status Control (Live Operations):
                      </small>
                      <div className="d-flex flex-wrap gap-1.5">
                        {['Pending', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            className={`btn btn-sm rounded-pill fw-bold ${
                              currentOrder.status === st ? 'btn-danger shadow-sm' : 'btn-outline-secondary bg-white text-dark border-opacity-25'
                            }`}
                            onClick={() => updateOrderStatus(currentOrder.id, st)}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Items & Address Summary */}
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-4 border h-100">
                        <h6 className="fw-bold text-dark mb-2 small text-uppercase text-muted">
                          <i className="fas fa-basket-shopping text-danger me-1"></i> Order Items
                        </h6>
                        <p className="fw-semibold text-dark small m-0" style={{ lineHeight: '1.6' }}>
                          {currentOrder.items}
                        </p>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-4 border h-100">
                        <h6 className="fw-bold text-dark mb-2 small text-uppercase text-muted">
                          <i className="fas fa-map-marker-alt text-danger me-1"></i> Delivery Address
                        </h6>
                        <strong className="d-block small text-dark mb-0.5">{currentOrder.customer} ({currentOrder.phone})</strong>
                        <span className="text-muted small d-block" style={{ lineHeight: '1.5' }}>
                          {currentOrder.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal Bottom Actions */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                {currentOrder.status !== 'Cancelled' && currentOrder.status !== 'Delivered' && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <i className="fas fa-ban"></i> Cancel Order
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                  onClick={() => {
                    closeTrackOrderModal();
                    navigateTo('contact');
                  }}
                >
                  <i className="fas fa-headset me-1"></i> Need Help?
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-sm rounded-pill px-4 fw-bold ms-auto"
                  onClick={closeTrackOrderModal}
                >
                  Close
                </button>
              </div>

              {/* Cancellation Reason Overlay Dialog */}
              {showCancelDialog && (
                <div
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 z-3"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
                >
                  <div className="bg-white rounded-4 shadow-lg p-4 w-100 max-w-md border animate__animated animate__fadeInUp" style={{ maxWidth: '480px' }}>
                    <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                          <i className="fas fa-exclamation-circle fs-5"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold m-0 text-dark">Cancel Order #{currentOrder.id}</h5>
                          <small className="text-muted">Select reason for order cancellation</small>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-close shadow-none"
                        onClick={() => setShowCancelDialog(false)}
                      ></button>
                    </div>

                    <form onSubmit={handleCancelOrderSubmit}>
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-dark">Why do you want to cancel this order?</label>
                        <div className="d-flex flex-column gap-2">
                          {[
                            'Ordered items by mistake',
                            'Delivery time taking too long',
                            'Incorrect delivery address or phone',
                            'Want to change payment method',
                            'Found better price elsewhere',
                            'Other'
                          ].map((reason) => (
                            <label
                              key={reason}
                              className={`p-2.5 rounded-3 border cursor-pointer d-flex align-items-center gap-2 transition-all ${
                                cancelReason === reason ? 'border-danger bg-danger-subtle fw-semibold text-danger' : 'bg-light text-dark'
                              }`}
                              style={{ fontSize: '0.85rem' }}
                            >
                              <input
                                type="radio"
                                name="cancelReason"
                                className="form-check-input mt-0"
                                checked={cancelReason === reason}
                                onChange={() => setCancelReason(reason)}
                              />
                              <span>{reason}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {cancelReason === 'Other' && (
                        <div className="mb-3">
                          <label className="form-label small fw-bold text-muted">Additional Details (Optional)</label>
                          <textarea
                            className="form-control form-control-sm rounded-3"
                            rows={2}
                            placeholder="Please specify why you are cancelling..."
                            value={cancelComments}
                            onChange={(e) => setCancelComments(e.target.value)}
                          ></textarea>
                        </div>
                      )}

                      <div className="alert alert-warning p-2.5 rounded-3 mb-3 small d-flex align-items-start gap-2">
                        <i className="fas fa-info-circle text-warning mt-0.5"></i>
                        <span>
                          If you paid using UPI, Card, or Net Banking, your payment of <strong>₹{currentOrder.total}</strong> will be refunded to your original payment account within 24-48 hours.
                        </span>
                      </div>

                      <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                        <button
                          type="button"
                          className="btn btn-light btn-sm rounded-pill px-3 fw-bold border"
                          onClick={() => setShowCancelDialog(false)}
                        >
                          Keep Order
                        </button>
                        <button
                          type="submit"
                          className="btn btn-danger btn-sm rounded-pill px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                        >
                          <i className="fas fa-check-circle"></i> Confirm Cancellation
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                <i className="fas fa-search-minus fs-2"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">No Order Found</h5>
              <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '360px' }}>
                We couldn't find an order matching "<strong>{searchInput}</strong>". Please check the Order ID.
              </p>
              {orders.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill px-4 fw-bold"
                  onClick={() => {
                    setActiveOrderId(orders[0].id);
                    setSearchInput(orders[0].id);
                  }}
                >
                  View Latest Order (#{orders[0].id})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

