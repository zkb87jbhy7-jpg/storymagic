// ─── Order Types ─── matches DB table: orders (Chapter 7.2)

export type OrderType = 'digital' | 'softcover' | 'hardcover' | 'gift';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PrintOptions {
  cover_type: string;
  size: string;
  gift_wrap: boolean;
  paper_quality: string;
  quantity: number;
}

export interface ShippingAddress {
  full_name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  book_id: string;
  order_type: OrderType;
  dedication_text: string | null;
  dedication_handwritten_url: string | null;
  print_options: PrintOptions | null;
  payment_status: PaymentStatus;
  payment_provider: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  shipping_address: ShippingAddress | null;
  shipping_method: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  print_provider: string | null;
  external_order_id: string | null;
  estimated_delivery: string | null;
  total_amount: number;
  currency: string;
  soft_proof_url: string | null;
  created_at: string;
}

/** Fields required when creating a new order */
export interface OrderCreate {
  book_id: string;
  order_type: OrderType;
  dedication_text?: string;
  dedication_handwritten_url?: string;
  print_options?: PrintOptions;
  shipping_address?: ShippingAddress;
  shipping_method?: string;
  currency?: string;
}
