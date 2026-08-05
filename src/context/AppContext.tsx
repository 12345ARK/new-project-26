import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, UserProfile, ToastMessage, FeedbackItem } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export type ViewPage = 
  | 'home'
  | 'all-items'
  | 'vegetables'
  | 'fruits'
  | 'spices'
  | 'biscuits'
  | 'chocolates'
  | 'contact'
  | 'login'
  | 'admin';

const DEFAULT_SEED_USERS: UserProfile[] = [];

const DEFAULT_SEED_ORDERS: Order[] = [];

const DEFAULT_SEED_FEEDBACKS: FeedbackItem[] = [];

interface AppContextType {
  currentView: ViewPage;
  authInitialMode: 'signin' | 'signup';
  setAuthInitialMode: (mode: 'signin' | 'signup') => void;
  navigateTo: (view: ViewPage, authMode?: 'signin' | 'signup') => void;

  cart: CartItem[];
  addToCart: (product: { title: string; price: number; image: string }) => void;
  removeFromCart: (index: number) => void;
  changeQty: (index: number, change: number) => void;
  clearCart: () => void;

  savedItems: Product[];
  toggleSavedItem: (product: Product) => void;
  isItemSaved: (titleOrId: string) => boolean;
  removeFromSaved: (titleOrId: string) => void;
  clearSavedItems: () => void;

  isLoggedIn: boolean;
  username: string;
  userEmail: string;
  userRole: 'customer' | 'admin';
  userPhone: string;
  userStreet: string;
  userCity: string;
  userPincode: string;
  userAddress: string;

  loginUser: (emailOrName: string, password?: string, role?: 'customer' | 'admin') => { success: boolean; message: string };
  registerUser: (name: string, email: string, password?: string) => { success: boolean; message: string };
  logoutUser: () => void;
  saveAddressDetails: (details: { phone: string; street: string; city: string; pincode: string; fullAddress?: string }) => void;
  clearSavedAddress: () => void;

  registeredUsers: UserProfile[];
  deleteUser: (email: string) => void;
  clearAllUserData: () => void;

  isAdminAuthenticated: boolean;
  adminLogin: (id: string, pass: string) => boolean;
  adminLogout: () => void;

  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  deleteOrder: (orderId: string) => void;

  isTrackModalOpen: boolean;
  trackingOrderId: string | null;
  openTrackOrderModal: (orderId?: string) => void;
  closeTrackOrderModal: () => void;

  feedbacks: FeedbackItem[];
  addFeedback: (fb: Omit<FeedbackItem, 'id' | 'date' | 'status'>) => void;
  updateFeedbackStatus: (id: string, status: FeedbackItem['status']) => void;
  deleteFeedback: (id: string) => void;

  isCartOpen: boolean;

  setIsCartOpen: (open: boolean) => void;
  isUserDrawerOpen: boolean;
  setIsUserDrawerOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isEmptyCartModalOpen: boolean;
  setIsEmptyCartModalOpen: (open: boolean) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (product: Product | null) => void;
  confirmedOrder: Order | null;

  toasts: ToastMessage[];
  triggerToast: (title: string, message: string, image?: string, type?: ToastMessage['type']) => void;

  ratings: Record<string, number>;
  rateProduct: (title: string, rating: number) => void;

  handleCheckoutStart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewPage>('home');
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fastmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fastmart_cart', JSON.stringify(cart));
  }, [cart]);

  // Saved for Later State
  const [savedItems, setSavedItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('fastmart_saved_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fastmart_saved_items', JSON.stringify(savedItems));
  }, [savedItems]);

  const isItemSaved = (titleOrId: string) => {
    return savedItems.some(
      item => item.id === titleOrId || item.title.toLowerCase() === titleOrId.toLowerCase()
    );
  };

  const toggleSavedItem = (product: Product) => {
    const alreadySaved = isItemSaved(product.title);
    if (alreadySaved) {
      setSavedItems(prev =>
        prev.filter(
          item => item.id !== product.id && item.title.toLowerCase() !== product.title.toLowerCase()
        )
      );
      triggerToast('Removed from Saved', `Removed "${product.title}" from Saved for Later.`, product.image, 'info');
    } else {
      setSavedItems(prev => [...prev, product]);
      triggerToast('Saved for Later ❤️', `Added "${product.title}" to Saved for Later!`, product.image, 'success');
    }
  };

  const removeFromSaved = (titleOrId: string) => {
    setSavedItems(prev =>
      prev.filter(
        item => item.id !== titleOrId && item.title.toLowerCase() !== titleOrId.toLowerCase()
      )
    );
    triggerToast('Removed Item', 'Item removed from Saved for Later.');
  };

  const clearSavedItems = () => {
    setSavedItems([]);
    triggerToast('List Cleared', 'All items removed from Saved for Later.');
  };

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('fastmart_logged_in') === 'true';
  });

  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('fastmart_username') || '';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('fastmart_user_email') || '';
  });

  const [userRole, setUserRole] = useState<'customer' | 'admin'>(() => {
    return (localStorage.getItem('fastmart_user_role') as 'customer' | 'admin') || 'customer';
  });

  // User Profile Address State
  const [userPhone, setUserPhone] = useState<string>('');
  const [userStreet, setUserStreet] = useState<string>('');
  const [userCity, setUserCity] = useState<string>('');
  const [userPincode, setUserPincode] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string>('');

  // Sync address from localStorage on load & user change
  useEffect(() => {
    if (!isLoggedIn) {
      setUserPhone('');
      setUserStreet('');
      setUserCity('');
      setUserPincode('');
      setUserAddress('');
      return;
    }

    const key = (userEmail || username || 'guest').toLowerCase().trim();
    const phone = localStorage.getItem(`fastmart_user_phone_${key}`) || localStorage.getItem('fastmart_user_phone') || '';
    const street = localStorage.getItem(`fastmart_user_street_${key}`) || localStorage.getItem('fastmart_user_street') || '';
    const city = localStorage.getItem(`fastmart_user_city_${key}`) || localStorage.getItem('fastmart_user_city') || '';
    const pin = localStorage.getItem(`fastmart_user_pincode_${key}`) || localStorage.getItem('fastmart_user_pincode') || '';
    const addr = localStorage.getItem(`fastmart_user_address_${key}`) || localStorage.getItem('fastmart_user_address') || '';

    setUserPhone(phone);
    setUserStreet(street);
    setUserCity(city);
    setUserPincode(pin);
    setUserAddress(addr);
  }, [isLoggedIn, username, userEmail]);

  // Registered Users State
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('fastmart_registered_users');
      return saved ? JSON.parse(saved) : DEFAULT_SEED_USERS;
    } catch {
      return DEFAULT_SEED_USERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('fastmart_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Firestore Live Listeners
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreOrders: Order[] = snapshot.docs.map(doc => doc.data() as Order);
        setOrders(firestoreOrders);
      }
    }, (error) => {
      console.warn('Firestore orders sync listener:', error);
    });

    const unsubFeedbacks = onSnapshot(collection(db, 'feedbacks'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreFeedbacks: FeedbackItem[] = snapshot.docs.map(doc => doc.data() as FeedbackItem);
        setFeedbacks(firestoreFeedbacks);
      }
    }, (error) => {
      console.warn('Firestore feedbacks sync listener:', error);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreUsers: UserProfile[] = snapshot.docs.map(doc => doc.data() as UserProfile);
        setRegisteredUsers(firestoreUsers);
      }
    }, (error) => {
      console.warn('Firestore users sync listener:', error);
    });

    return () => {
      unsubOrders();
      unsubFeedbacks();
      unsubUsers();
    };
  }, []);

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fastmart_admin_auth') === 'true';
  });

  const adminLogin = (id: string, pass: string): boolean => {
    const cleanId = id.trim().toLowerCase();
    const cleanPass = pass.trim();
    if ((cleanId === 'admin' || cleanId === 'admin@fastmart.com') && (cleanPass === 'admin123' || cleanPass === 'password123')) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('fastmart_admin_auth', 'true');
      triggerToast('Admin Logged In 🛡️', 'Welcome to the FastMart Control Panel!', undefined, 'info');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('fastmart_admin_auth');
    triggerToast('Admin Logged Out', 'Admin session ended.');
  };

  const deleteUser = (email: string) => {
    setRegisteredUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    triggerToast('User Removed', `User account ${email} deleted.`);
    try {
      const userDocId = email.trim().toLowerCase().replace(/[/.]/g, '_');
      deleteDoc(doc(db, 'users', userDocId));
    } catch (err) {
      console.error('Firestore delete user error:', err);
    }
  };

  const clearAllUserData = () => {
    setRegisteredUsers([]);
    setOrders([]);
    setFeedbacks([]);
    localStorage.removeItem('fastmart_registered_users');
    localStorage.removeItem('fastmart_orders');
    localStorage.removeItem('fastmart_feedbacks');
    localStorage.removeItem('fastmart_logged_in');
    localStorage.removeItem('fastmart_username');
    localStorage.removeItem('fastmart_user_email');
    localStorage.removeItem('fastmart_user_role');
    setIsLoggedIn(false);
    setUsername('');
    setUserEmail('');
    setUserRole('customer');
    triggerToast('All User Data Cleared 🧹', 'All previous user profiles, orders, and feedback records have been removed.', undefined, 'info');
  };

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('fastmart_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : DEFAULT_SEED_ORDERS;
      }
      return DEFAULT_SEED_ORDERS;
    } catch {
      return DEFAULT_SEED_ORDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('fastmart_orders', JSON.stringify(orders));
  }, [orders]);

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    triggerToast('Order Updated', `Order ${orderId} status changed to ${status}.`, undefined, 'info');
    try {
      const existing = orders.find(o => o.id === orderId);
      if (existing) {
        setDoc(doc(db, 'orders', orderId), { ...existing, status }, { merge: true });
      }
    } catch (err) {
      console.error('Firestore order update error:', err);
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    triggerToast('Order Deleted', `Order ${orderId} removed from records.`);
    try {
      deleteDoc(doc(db, 'orders', orderId));
    } catch (err) {
      console.error('Firestore order delete error:', err);
    }
  };

  // Feedbacks State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem('fastmart_feedbacks');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : DEFAULT_SEED_FEEDBACKS;
      }
      return DEFAULT_SEED_FEEDBACKS;
    } catch {
      return DEFAULT_SEED_FEEDBACKS;
    }
  });

  useEffect(() => {
    localStorage.setItem('fastmart_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (fb: Omit<FeedbackItem, 'id' | 'date' | 'status'>) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newFb: FeedbackItem = {
      ...fb,
      id: `FB-${Math.floor(100000 + Math.random() * 900000)}`,
      date: dateStr,
      status: 'Unread',
    };
    setFeedbacks(prev => [newFb, ...prev]);
    triggerToast('Feedback Sent! ⭐', 'Thank you! Your feedback has been sent directly to FastMart Store Admins.', undefined, 'success');
    try {
      setDoc(doc(db, 'feedbacks', newFb.id), newFb);
    } catch (err) {
      console.error('Firestore feedback save error:', err);
    }
  };

  const updateFeedbackStatus = (id: string, status: FeedbackItem['status']) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    triggerToast('Feedback Status Updated', `Feedback ${id} marked as ${status}.`, undefined, 'info');
    try {
      const existing = feedbacks.find(f => f.id === id);
      if (existing) {
        setDoc(doc(db, 'feedbacks', id), { ...existing, status }, { merge: true });
      }
    } catch (err) {
      console.error('Firestore feedback status update error:', err);
    }
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
    triggerToast('Feedback Deleted', `Feedback ${id} deleted.`);
    try {
      deleteDoc(doc(db, 'feedbacks', id));
    } catch (err) {
      console.error('Firestore feedback delete error:', err);
    }
  };

  // Ratings State
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fastmart_rating_')) {
        const titleKey = key.replace('fastmart_rating_', '');
        initial[titleKey] = parseInt(localStorage.getItem(key) || '5', 10);
      }
    }
    return initial;
  });

  const rateProduct = (title: string, rating: number) => {
    const titleKey = title.replace(/\s+/g, '_');
    localStorage.setItem(`fastmart_rating_${titleKey}`, rating.toString());
    setRatings(prev => ({ ...prev, [titleKey]: rating }));
    triggerToast(title, `Rated ${rating} stars! Thank you.`, undefined, 'rating');
  };

  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEmptyCartModalOpen, setIsEmptyCartModalOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Track Order Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const openTrackOrderModal = (orderId?: string) => {
    if (orderId) {
      setTrackingOrderId(orderId);
    } else if (orders.length > 0) {
      setTrackingOrderId(orders[0].id);
    } else {
      setTrackingOrderId(null);
    }
    setIsTrackModalOpen(true);
  };

  const closeTrackOrderModal = () => {
    setIsTrackModalOpen(false);
  };

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const triggerToast = (title: string, message: string, image?: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, title, message, image, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const navigateTo = (view: ViewPage, authMode?: 'signin' | 'signup') => {
    if (authMode) {
      setAuthInitialMode(authMode);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: { title: string; price: number; image: string }) => {
    setCart(prev => {
      const existing = prev.find(item => item.title === product.title);
      if (existing) {
        return prev.map(item =>
          item.title === product.title
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { title: product.title, price: product.price, image: product.image, quantity: 1 }];
    });
    triggerToast(product.title, 'Action completed!', product.image, 'success');
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const changeQty = (index: number, change: number) => {
    setCart(prev => {
      return prev
        .map((item, i) => {
          if (i === index) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const registerUser = (name: string, email: string, password?: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password ? password.trim() : '';

    // Check if account already exists
    const existingUser = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      triggerToast('Account Exists', 'An account with this email already exists. Please Sign In.', undefined, 'info');
      return { success: false, message: 'An account with this email already exists. Please Sign In.' };
    }

    const role = cleanEmail.includes('admin') ? 'admin' : 'customer';
    const newUser: UserProfile = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      phone: '',
      address: '',
      role,
    };

    // Save newly created user to database (registeredUsers array & localStorage & Firestore)
    setRegisteredUsers(prev => [...prev, newUser]);
    try {
      const userDocId = cleanEmail.replace(/[/.]/g, '_');
      setDoc(doc(db, 'users', userDocId), newUser, { merge: true });
    } catch (err) {
      console.error('Firestore register error:', err);
    }

    triggerToast('Account Created Successfully! 🎉', 'You can now sign in with your credentials.', undefined, 'success');
    return { success: true, message: 'Account created successfully! Please sign in with your credentials.' };
  };

  const loginUser = (emailOrName: string, password?: string, roleArg?: 'customer' | 'admin'): { success: boolean; message: string } => {
    const inputKey = emailOrName.trim().toLowerCase();
    const inputPass = password ? password.trim() : '';

    // Search for existing registered user in database
    const existingUser = registeredUsers.find(
      u => u.email.toLowerCase() === inputKey || u.name.toLowerCase() === inputKey
    );

    if (!existingUser) {
      triggerToast('Account Not Found ⚠️', 'No account found with these details. Please Sign Up first!', undefined, 'info');
      return { success: false, message: 'Account does not exist! Please create an account using Sign Up first.' };
    }

    // Validate password if user set a password during signup
    if (existingUser.password && inputPass && existingUser.password !== inputPass) {
      triggerToast('Incorrect Password ❌', 'Invalid password. Please try again.', undefined, 'info');
      return { success: false, message: 'Incorrect password! Please check your credentials.' };
    }

    // Log the user in upon successful match
    const role = roleArg || existingUser.role;

    localStorage.setItem('fastmart_logged_in', 'true');
    localStorage.setItem('fastmart_username', existingUser.name);
    localStorage.setItem('fastmart_user_email', existingUser.email);
    localStorage.setItem('fastmart_user_role', role);

    setIsLoggedIn(true);
    setUsername(existingUser.name);
    setUserEmail(existingUser.email);
    setUserRole(role);

    triggerToast(`Welcome back, ${existingUser.name}! 👋`, 'Signed in successfully!', undefined, 'info');
    return { success: true, message: 'Signed in successfully!' };
  };

  const logoutUser = () => {
    localStorage.removeItem('fastmart_logged_in');
    localStorage.removeItem('fastmart_username');
    localStorage.removeItem('fastmart_user_email');
    localStorage.removeItem('fastmart_user_role');
    localStorage.removeItem('fastmart_redirect_checkout');

    setIsLoggedIn(false);
    setUsername('');
    setUserEmail('');
    setUserRole('customer');
    setUserPhone('');
    setUserStreet('');
    setUserCity('');
    setUserPincode('');
    setUserAddress('');

    triggerToast('Logged Out', 'You have logged out successfully!', undefined, 'logout');
  };

  const saveAddressDetails = ({ phone, street, city, pincode, fullAddress }: { phone: string; street: string; city: string; pincode: string; fullAddress?: string }) => {
    const key = (userEmail || username || 'guest').toLowerCase().trim();
    const constructed = fullAddress || `${street}, ${city} - ${pincode}`;

    localStorage.setItem(`fastmart_user_phone_${key}`, phone);
    localStorage.setItem(`fastmart_user_street_${key}`, street);
    localStorage.setItem(`fastmart_user_city_${key}`, city);
    localStorage.setItem(`fastmart_user_pincode_${key}`, pincode);
    localStorage.setItem(`fastmart_user_address_${key}`, constructed);

    localStorage.setItem('fastmart_user_phone', phone);
    localStorage.setItem('fastmart_user_street', street);
    localStorage.setItem('fastmart_user_city', city);
    localStorage.setItem('fastmart_user_pincode', pincode);
    localStorage.setItem('fastmart_user_address', constructed);

    setUserPhone(phone);
    setUserStreet(street);
    setUserCity(city);
    setUserPincode(pincode);
    setUserAddress(constructed);

    // Sync into registeredUsers array & Firestore
    if (userEmail || username) {
      const currentEmail = userEmail || `${username.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      const userDocId = currentEmail.trim().toLowerCase().replace(/[/.]/g, '_');
      try {
        setDoc(doc(db, 'users', userDocId), {
          name: username || 'User',
          email: currentEmail,
          phone,
          street,
          city,
          pincode,
          address: constructed,
          role: userRole
        }, { merge: true });
      } catch (err) {
        console.error('Firestore saveAddressDetails error:', err);
      }

      setRegisteredUsers(prev => {
        const index = prev.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase() || u.name.toLowerCase() === username.toLowerCase());
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            phone,
            street,
            city,
            pincode,
            address: constructed
          };
          return copy;
        }
        return [
          ...prev,
          {
            name: username || 'User',
            email: currentEmail,
            phone,
            street,
            city,
            pincode,
            address: constructed,
            role: userRole
          }
        ];
      });
    }
  };

  const clearSavedAddress = () => {
    const key = (userEmail || username || 'guest').toLowerCase().trim();
    localStorage.removeItem(`fastmart_user_phone_${key}`);
    localStorage.removeItem(`fastmart_user_street_${key}`);
    localStorage.removeItem(`fastmart_user_city_${key}`);
    localStorage.removeItem(`fastmart_user_pincode_${key}`);
    localStorage.removeItem(`fastmart_user_address_${key}`);

    localStorage.removeItem('fastmart_user_phone');
    localStorage.removeItem('fastmart_user_street');
    localStorage.removeItem('fastmart_user_city');
    localStorage.removeItem('fastmart_user_pincode');
    localStorage.removeItem('fastmart_user_address');

    setUserPhone('');
    setUserStreet('');
    setUserCity('');
    setUserPincode('');
    setUserAddress('');

    triggerToast('Address Removed', 'Saved address has been cleared.');
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setConfirmedOrder(order);
    setIsSuccessModalOpen(true);
    try {
      setDoc(doc(db, 'orders', order.id), order);
    } catch (err) {
      console.error('Firestore addOrder error:', err);
    }
  };

  const handleCheckoutStart = () => {
    if (cart.length === 0) {
      setIsEmptyCartModalOpen(true);
      return;
    }

    if (!isLoggedIn) {
      setIsCartOpen(false);
      setIsLoginModalOpen(true);
      return;
    }

    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        authInitialMode,
        setAuthInitialMode,
        navigateTo,
        cart,
        addToCart,
        removeFromCart,
        changeQty,
        clearCart,
        savedItems,
        toggleSavedItem,
        isItemSaved,
        removeFromSaved,
        clearSavedItems,
        isLoggedIn,
        username,
        userEmail,
        userRole,
        userPhone,
        userStreet,
        userCity,
        userPincode,
        userAddress,
        loginUser,
        registerUser,
        logoutUser,
        saveAddressDetails,
        clearSavedAddress,
        registeredUsers,
        deleteUser,
        clearAllUserData,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        isTrackModalOpen,
        trackingOrderId,
        openTrackOrderModal,
        closeTrackOrderModal,
        feedbacks,
        addFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        isCartOpen,
        setIsCartOpen,
        isUserDrawerOpen,
        setIsUserDrawerOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isEmptyCartModalOpen,
        setIsEmptyCartModalOpen,
        selectedProductModal,
        setSelectedProductModal,
        confirmedOrder,
        toasts,
        triggerToast,
        ratings,
        rateProduct,
        handleCheckoutStart
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
