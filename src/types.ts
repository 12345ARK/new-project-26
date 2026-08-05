export interface Product {
  id: string;
  title: string;
  price: number;
  unit?: string; // e.g. "/kg", "/piece", "/box", "/bunch"
  image: string;
  category: 'fruits' | 'vegetables' | 'spices' | 'snacks' | 'groceries' | 'most-viewed' | 'daily' | 'biscuits' | 'chocolates' | 'Others';
  subCategory?: string; // e.g. 'cream', 'sweet', 'salted', 'healthy', 'milk', 'dark', 'white', 'premium', 'whole', 'powder'
  benefits?: string;
  expiry?: string;
  rating?: number;
}

export interface CartItem {
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: string;
  total: number;
  date: string;
  status: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  street?: string;
  city?: string;
  pincode?: string;
  role: 'customer' | 'admin';
  password?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  image?: string;
  type?: 'success' | 'info' | 'rating' | 'logout';
}

export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: 'Product Quality' | 'Delivery Experience' | 'App / Website' | 'Customer Support' | 'General Suggestion';
  rating: number;
  message: string;
  date: string;
  status: 'Unread' | 'Reviewed' | 'Resolved';
}
