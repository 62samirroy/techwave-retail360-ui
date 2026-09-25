import { ApiResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'retail360_auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage access restricted:', e);
  }
}

async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
      },
      credentials: 'include', // sends HTTP-only session cookies
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      message: 'Network error or backend API server is offline. Please make sure the API is running on port 5000.',
      error: error.message,
    };
  }
}

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetcher<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },
  register: async (data: any) => {
    const res = await fetcher<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },
  sendRegisterCode: (data: { name: string; email: string }) =>
    fetcher<any>('/auth/register/send-code', { method: 'POST', body: JSON.stringify(data) }),
  verifyRegisterCode: async (data: { name: string; email: string; password: string; phone?: string; code: string }) => {
    const res = await fetcher<any>('/auth/register/verify', { method: 'POST', body: JSON.stringify(data) });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },
  loginWithGoogle: async (data: { email: string; name?: string; avatarUrl?: string; googleId?: string; idToken?: string }) => {
    const res = await fetcher<any>('/auth/google', { method: 'POST', body: JSON.stringify(data) });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },
  sendPhoneOtp: (phone: string) =>
    fetcher<any>('/auth/phone/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyPhoneOtp: async (phone: string, otp: string) => {
    const res = await fetcher<any>('/auth/phone/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },
  getMe: () => fetcher<any>('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; bio?: string; avatarUrl?: string }) =>
    fetcher<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetcher<any>('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  forgotPassword: (email: string) =>
    fetcher<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    fetcher<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  logout: async () => {
    setAuthToken(null);
    return fetcher<any>('/auth/logout', { method: 'POST' });
  },

  // Products
  getProducts: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return fetcher<any>(`/products${query}`);
  },
  getProductById: (id: string) => fetcher<any>(`/products/${id}`),
  createProduct: (data: any) =>
    fetcher<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) =>
    fetcher<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    fetcher<any>(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => fetcher<any>('/categories'),
  createCategory: (data: any) =>
    fetcher<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) =>
    fetcher<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    fetcher<any>(`/categories/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: () => fetcher<any>('/cart'),
  addToCart: (productId: string, quantity = 1) =>
    fetcher<any>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCartItem: (itemId: string, quantity: number) =>
    fetcher<any>(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (itemId: string) =>
    fetcher<any>(`/cart/${itemId}`, { method: 'DELETE' }),
  clearCart: () => fetcher<any>('/cart', { method: 'DELETE' }),

  // Payments & Checkout
  createRazorpayOrder: (orderData: any) =>
    fetcher<any>('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  verifyPayment: (paymentData: any) =>
    fetcher<any>('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // Orders
  getOrders: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return fetcher<any>(`/orders${query}`);
  },
  getOrderById: (id: string) => fetcher<any>(`/orders/${id}`),
  updateOrder: (id: string, data: any) =>
    fetcher<any>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  trackOrder: (orderNumber: string, identifier?: string) => {
    const query = `?orderNumber=${encodeURIComponent(orderNumber)}${identifier ? `&identifier=${encodeURIComponent(identifier)}` : ''}`;
    return fetcher<any>(`/orders/track${query}`);
  },

  // Addresses
  getAddresses: () => fetcher<any>('/addresses'),
  createAddress: (data: any) =>
    fetcher<any>('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id: string, data: any) =>
    fetcher<any>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (id: string) =>
    fetcher<any>(`/addresses/${id}`, { method: 'DELETE' }),
  setDefaultAddress: (id: string) =>
    fetcher<any>(`/addresses/${id}/default`, { method: 'PATCH' }),

  // Notifications
  getNotifications: () => fetcher<any>('/notifications'),
  markNotificationRead: (id: string) =>
    fetcher<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    fetcher<any>('/notifications/read-all', { method: 'PATCH' }),

  // Inventory
  getInventory: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return fetcher<any>(`/inventory${query}`);
  },
  adjustInventory: (data: any) =>
    fetcher<any>('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
  getInventoryHistory: (productId?: string) => {
    const query = productId ? `?productId=${productId}` : '';
    return fetcher<any>(`/inventory/history${query}`);
  },

  // Customers
  getCustomers: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return fetcher<any>(`/customers${query}`);
  },

  // Inquiries
  getInquiries: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetcher<any>(`/inquiries${query}`);
  },
  submitInquiry: (data: any) =>
    fetcher<any>('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  updateInquiry: (id: string, data: any) =>
    fetcher<any>(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Reviews
  getReviews: (productId: string) => fetcher<any>(`/reviews?productId=${productId}`),
  checkReviewEligibility: (productId: string) => fetcher<any>(`/reviews/eligibility?productId=${productId}`),
  submitReview: (data: any) =>
    fetcher<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getAdminReviews: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetcher<any>(`/admin/reviews${query}`);
  },
  updateReviewStatus: (id: string, status: string) =>
    fetcher<any>(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteReview: (id: string) =>
    fetcher<any>(`/admin/reviews/${id}`, { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => fetcher<any>('/wishlist'),
  toggleWishlist: (productId: string) =>
    fetcher<any>('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  moveWishlistToCart: (productId: string) =>
    fetcher<any>('/wishlist/move-to-cart', { method: 'POST', body: JSON.stringify({ productId }) }),

  // Analytics
  getAnalytics: (range = '30d') => fetcher<any>(`/analytics?range=${range}`),

  // AI
  chatCustomerAI: (message: string, conversationId?: string | null) =>
    fetcher<any>('/ai/customer', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    }),
  chatBusinessAI: (message: string) =>
    fetcher<any>('/ai/business', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Settings
  getSettings: () => fetcher<any>('/settings'),
  updateSettings: (data: any) =>
    fetcher<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
