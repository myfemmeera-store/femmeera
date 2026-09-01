export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  user_type: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  email_verified?: boolean;
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
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size: string;
  color: string;
  color_code?: string | null;
  price: number;
  mrp: number;
  stock: number;
  low_stock_threshold?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ProductImage {
  id: number;
  product_id: number;
  product_variant_id?: number | null;
  color_name?: string | null;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
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
  price?: number;
  mrp?: number;
  rating?: number;
  review_count?: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
  reviews?: ProductReview[];
  category?: Category;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  variant_id: number;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderItem {
  id: number;
  product_name_snapshot: string;
  sku_snapshot: string;
  size_snapshot: string;
  color_snapshot: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_amount: number;
}

export interface Order {
  id: number;
  order_number: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';
  order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  shipping_address_snapshot: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: OrderItem[];
  created_at: string;
}

export interface HeroBanner {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  mobile_image_url?: string;
}

export interface PopupCMS {
  id: number;
  title: string;
  description: string;
  coupon_code?: string;
  cta_text: string;
  cta_url: string;
  image_url?: string;
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
