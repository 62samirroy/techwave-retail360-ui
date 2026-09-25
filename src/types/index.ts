export type Role = 'CUSTOMER' | 'ADMIN';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  demoOtp?: string;
}

export interface ProductAttributeData {
  id?: string;
  name: string;
  value: string;
}

export interface ProductImageData {
  id?: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: string;
  sortOrder: number;
  _count?: {
    products: number;
  };
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  categoryId: string;
  category?: CategoryData;
  price: number;
  discountPrice?: number | null;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  status: string;
  isFeatured: boolean;
  isBestseller: boolean;
  tags?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  images: ProductImageData[];
  attributes: ProductAttributeData[];
  reviews?: ReviewData[];
  rating?: number;
  reviewsCount?: number;
  inventory?: {
    currentStock: number;
    reservedStock: number;
    lowStockAlert: boolean;
  };
}

export interface CartItemData {
  id: string;
  cartId: string;
  productId: string;
  product: ProductData;
  quantity: number;
  price: number;
  itemTotal: number;
}

export interface CartData {
  id: string;
  items: CartItemData[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
}

export interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage?: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
  attributesJson?: string | null;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderData {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: OrderItemData[];
}

export interface ReviewData {
  id: string;
  productId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string | Date;
}

export interface InquiryData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  productId?: string | null;
  product?: {
    id: string;
    name: string;
    sku: string;
  } | null;
  inquiryType: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  adminNotes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  averageOrderValue: number;
  recentOrders: OrderData[];
  topProducts: {
    id: string;
    name: string;
    sku: string;
    soldCount: number;
    revenue: number;
  }[];
  salesByCategory: {
    category: string;
    revenue: number;
    count: number;
  }[];
  salesByDate: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
}

export interface AddressData {
  id: string;
  userId: string;
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface NotificationData {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'INVENTORY' | 'SYSTEM';
  isRead: boolean;
  link?: string | null;
  createdAt: string | Date;
}
