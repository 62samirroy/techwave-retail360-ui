import { ApiResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
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
  login: (credentials: any) =>
    fetcher<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: any) =>
    fetcher<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetcher<any>('/auth/me'),
  logout: () => fetcher<any>('/auth/logout', { method: 'POST' }),

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
  submitReview: (data: any) =>
    fetcher<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Wishlist
  getWishlist: () => fetcher<any>('/wishlist'),
  toggleWishlist: (productId: string) =>
    fetcher<any>('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),

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
