export type KioskCategoryType = 
  | 'food' 
  | 'sweets' 
  | 'crafts' 
  | 'services' 
  | 'printing' 
  | 'fashion' 
  | 'tech' 
  | 'other';

export interface KioskReview {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_faculty?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface KioskProject {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_username?: string;
  owner_faculty?: string;
  title: string;
  category: KioskCategoryType;
  description: string;
  price_range?: string;
  whatsapp_number: string;
  campus_locations: string[];
  images: string[];
  clicks_count: number;
  likes_count: number;
  rating_avg: number;
  rating_count: number;
  comments_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  rejection_reason?: string;
  is_liked?: boolean;
  reviews?: KioskReview[];
  user_review?: KioskReview | null;
  trending_score?: number;
  created_at: string;
  updated_at: string;
}

export interface KioskCategoryItem {
  id: string;
  name: string;
  count: number;
}
