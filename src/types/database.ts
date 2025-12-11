export type UserRole = 'customer' | 'business_owner' | 'admin';
export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type ServiceRequestStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'canceled';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  service_radius_miles: number;
  is_verified: boolean;
  verification_status: VerificationStatus;
  is_active: boolean;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BusinessCategory {
  business_id: string;
  category_id: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  category_id: string;
  title: string;
  description: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  service_request_id: string;
  business_id: string;
  amount: number;
  description: string | null;
  estimated_duration: string | null;
  valid_until: string | null;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  customer_id: string;
  service_request_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  service_request_id: string | null;
  customer_id: string;
  business_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  business_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  service_request_id: string;
  is_viewed: boolean;
  is_contacted: boolean;
  created_at: string;
}

export interface BusinessCredential {
  id: string;
  business_id: string;
  credential_type: string;
  credential_number: string | null;
  issuing_authority: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  document_url: string | null;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

// Database helper types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at' | 'rating_average' | 'rating_count'>;
        Update: Partial<Omit<Business, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      service_requests: {
        Row: ServiceRequest;
        Insert: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceRequest, 'id' | 'created_at'>>;
      };
      quotes: {
        Row: Quote;
        Insert: Omit<Quote, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Quote, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      business_credentials: {
        Row: BusinessCredential;
        Insert: Omit<BusinessCredential, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessCredential, 'id' | 'created_at'>>;
      };
    };
  };
}
