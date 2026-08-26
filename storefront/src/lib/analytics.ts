export type AnalyticsEvent =
  | 'PAGE_VIEW'
  | 'PRODUCT_VIEW'
  | 'SEARCH'
  | 'CATEGORY_VIEW'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'WISHLIST_ADD'
  | 'CHECKOUT_START'
  | 'PURCHASE';

export interface AnalyticsPayload {
  product_id?: number;
  product_name?: string;
  category_name?: string;
  search_query?: string;
  price?: number;
  quantity?: number;
  order_number?: string;
  [key: string]: unknown;
}

export const analytics = {
  track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Event Tracked]: ${event}`, payload);
    }
    // Extensible hook for Google Analytics / Meta Pixel / Custom Backend Logging
  }
};
