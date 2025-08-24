export interface User {
  id: string;
  name: string;
  email: string;
  zip?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  room_width: number;
  room_length: number;
  room_height: number;
  layout_type: 'galley' | 'l-shape' | 'u-shape' | 'island';
  linear_footage: number;
  cabinet_style: string;
  cabinet_material: string;
  hardware_type: string;
  upper_percentage: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Estimate {
  id: string;
  project_id: string;
  cabinet_cost_low: number;
  cabinet_cost_med: number;
  cabinet_cost_high: number;
  labor_cost_low: number;
  labor_cost_med: number;
  labor_cost_high: number;
  contingency_percentage: number;
  total_low: number;
  total_med: number;
  total_high: number;
}

export interface Contractor {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  zips_served: string[];
  specialties: string[];
  price_tier: 'budget' | 'mid' | 'premium';
  badge_verified: boolean;
  badge_licensed: boolean;
  badge_insured: boolean;
  phone?: string;
  email?: string;
  website?: string;
}

export interface RFQ {
  id: string;
  project_id: string;
  contractor_id: string;
  status: 'pending' | 'responded' | 'declined';
  message?: string;
  created_at?: string;
}

export type PricingTier = 'low' | 'med' | 'high';