import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU0MjM4MCwiZXhwIjoxOTU4MTE4MzgwfQ.demo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  zip_code?: string;
  user_type: 'homeowner' | 'business';
  business_type?: 'contractor' | 'cabinet_shop' | 'designer';
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_website?: string;
  years_in_business?: number;
  license_number?: string;
  service_areas?: string[];
  created_at?: string;
  updated_at?: string;
}

// Demo data for MVP
export const demoContractors = [
  {
    id: '1',
    name: 'Elite Kitchen Solutions',
    rating: 4.9,
    review_count: 127,
    zips_served: ['10001', '10002', '10003', '10004', '10005'],
    specialties: ['Custom Cabinets', 'Kitchen Remodels', 'Countertops'],
    price_tier: 'premium' as const,
    badge_verified: true,
    badge_licensed: true,
    badge_insured: true,
    phone: '(555) 123-4567',
    email: 'contact@elitekitchens.com'
  },
  {
    id: '2',
    name: 'Modern Home Contractors',
    rating: 4.7,
    review_count: 89,
    zips_served: ['10001', '10002', '10003', '10006', '10007'],
    specialties: ['Kitchen Renovation', 'Cabinet Installation', 'Design'],
    price_tier: 'mid' as const,
    badge_verified: true,
    badge_licensed: true,
    badge_insured: false,
    phone: '(555) 234-5678',
    email: 'hello@modernhome.com'
  },
  {
    id: '3',
    name: 'Budget Kitchen Pros',
    rating: 4.2,
    review_count: 56,
    zips_served: ['10001', '10004', '10005', '10008', '10009'],
    specialties: ['Affordable Renovations', 'Cabinet Refacing', 'DIY Support'],
    price_tier: 'budget' as const,
    badge_verified: false,
    badge_licensed: true,
    badge_insured: true,
    phone: '(555) 345-6789',
    email: 'info@budgetkitchen.com'
  }
];

export const calculateLinearFootage = (width: number, length: number, layout: string): number => {
  const perimeter = 2 * (width + length);
  const layoutMultiplier = {
    'galley': 0.6,
    'l-shape': 0.7,
    'u-shape': 0.8,
    'island': 1.1
  };
  return Math.round(perimeter * (layoutMultiplier[layout as keyof typeof layoutMultiplier] || 0.7));
};

export const calculateEstimate = (linearFootage: number, style: string, material: string, color?: string) => {
  const baseCostPerLF = {
    'shaker': { 'plywood': 180, 'mdf': 120, 'solid-wood': 250 },
    'raised-panel': { 'plywood': 220, 'mdf': 150, 'solid-wood': 320 },
    'flat-panel': { 'plywood': 160, 'mdf': 100, 'solid-wood': 210 },
    'modern': { 'plywood': 240, 'mdf': 170, 'solid-wood': 350 }
  };

  const base = baseCostPerLF[style as keyof typeof baseCostPerLF]?.[material as keyof typeof baseCostPerLF['shaker']] || 150;
  
  // Apply color premium if specified
  const colorPremiums: { [key: string]: number } = {
    'white': 0,
    'cream': 0.05,
    'gray': 0.10,
    'navy': 0.15,
    'sage': 0.15,
    'charcoal': 0.20,
    'natural': 0.25,
    'espresso': 0.30
  };
  
  const colorMultiplier = color ? (1 + (colorPremiums[color] || 0)) : 1;
  const adjustedBase = Math.round(base * colorMultiplier);
  
  const cabinetCosts = {
    low: Math.round(linearFootage * adjustedBase * 0.8),
    med: Math.round(linearFootage * adjustedBase),
    high: Math.round(linearFootage * adjustedBase * 1.3)
  };

  const laborCosts = {
    low: Math.round(cabinetCosts.low * 0.3),
    med: Math.round(cabinetCosts.med * 0.4),
    high: Math.round(cabinetCosts.high * 0.5)
  };

  const contingency = 0.15;
  
  return {
    cabinet_cost_low: cabinetCosts.low,
    cabinet_cost_med: cabinetCosts.med,
    cabinet_cost_high: cabinetCosts.high,
    labor_cost_low: laborCosts.low,
    labor_cost_med: laborCosts.med,
    labor_cost_high: laborCosts.high,
    contingency_percentage: contingency,
    total_low: Math.round((cabinetCosts.low + laborCosts.low) * (1 + contingency)),
    total_med: Math.round((cabinetCosts.med + laborCosts.med) * (1 + contingency)),
    total_high: Math.round((cabinetCosts.high + laborCosts.high) * (1 + contingency))
  };
};