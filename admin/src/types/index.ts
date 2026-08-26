export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  user_type: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  roles?: string[];
  email_verified?: boolean;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  description?: string;
}

export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  sort_order: number;
  status: 'ACTIVE' | 'DISABLED' | 'ARCHIVED';
  seo_title?: string | null;
  seo_description?: string | null;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  banner_url?: string | null;
  description?: string | null;
  is_featured: boolean;
  status: 'ACTIVE' | 'DISABLED';
}

export interface ProductVariant {
  id?: number;
  product_id?: number;
  sku: string;
  size: string;
  color: string;
  price: number;
  mrp: number;
  stock: number;
  low_stock_threshold?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ProductImage {
  id?: number;
  product_id?: number;
  product_variant_id?: number | null;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  collection_id?: number | null;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  short_description?: string | null;
  brand: string;
  gender: 'WOMEN' | 'MEN' | 'UNISEX';
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  category?: Category;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: number;
  variant_id: number;
  product_name?: string;
  sku?: string;
  size?: string;
  color?: string;
  available_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  variant?: {
    sku: string;
    size: string;
    color: string;
    product?: {
      name: string;
    };
  };
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';
  order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  created_at: string;
}

export interface DashboardStats {
  todays_sales: number;
  orders_today: number;
  total_customers: number;
  pending_orders: number;
  low_stock_products: number;
  recent_orders: Order[];
  sales_summary: {
    currency: string;
    period: string;
  };
}

export interface WatchAndShopReel {
  id: number;
  title: string;
  video_url: string;
  video_display_url?: string;
  poster_url?: string | null;
  poster_display_url?: string | null;
  product_url: string;
  button_text?: string;
  sort_order: number;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}
