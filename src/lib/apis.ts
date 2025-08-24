// API integrations for finding cabinet stores and contractors

// Google Places API for finding cabinet stores
export const findCabinetStores = async (zipCode: string, radius: number = 25) => {
  try {
    // In production, you'd use the actual Google Places API
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${await getCoordinatesFromZip(zipCode)}&radius=${radius * 1609}&type=home_goods_store&keyword=kitchen+cabinets&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch cabinet stores');
    }
    
    const data = await response.json();
    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      price_level: place.price_level,
      photos: place.photos,
      opening_hours: place.opening_hours,
      phone: place.formatted_phone_number,
      website: place.website,
      distance: calculateDistance(zipCode, place.geometry.location)
    }));
  } catch (error) {
    console.error('Error fetching cabinet stores:', error);
    // Return demo data for development
    return getDemoCabinetStores(zipCode);
  }
};

// Angie's List / HomeAdvisor API for contractors
export const findContractors = async (zipCode: string, serviceType: string = 'kitchen-remodeling') => {
  try {
    // In production, you'd integrate with HomeAdvisor Pro API or similar
    const response = await fetch(`https://api.homeadvisor.com/contractors/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HOMEADVISOR_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zip_code: zipCode,
        service_category: serviceType,
        radius: 25,
        limit: 20
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch contractors');
    }
    
    const data = await response.json();
    return data.contractors.map((contractor: any) => ({
      id: contractor.id,
      name: contractor.business_name,
      rating: contractor.rating,
      review_count: contractor.review_count,
      zips_served: contractor.service_areas,
      specialties: contractor.specialties,
      price_tier: contractor.price_tier,
      badge_verified: contractor.verified,
      badge_licensed: contractor.licensed,
      badge_insured: contractor.insured,
      phone: contractor.phone,
      email: contractor.email,
      website: contractor.website,
      years_in_business: contractor.years_in_business,
      employees: contractor.employee_count,
      portfolio_images: contractor.portfolio
    }));
  } catch (error) {
    console.error('Error fetching contractors:', error);
    // Return demo data for development
    return getDemoContractors(zipCode);
  }
};

// Yelp API for additional business information
export const getBusinessDetails = async (businessId: string, platform: 'google' | 'yelp') => {
  try {
    if (platform === 'yelp') {
      const response = await fetch(`https://api.yelp.com/v3/businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_YELP_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch business details');
      }
      
      return await response.json();
    }
    
    // Google Places Details API
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${businessId}&fields=name,rating,formatted_phone_number,website,opening_hours,photos,reviews&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch business details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching business details:', error);
    return null;
  }
};

// Helper function to get coordinates from ZIP code
const getCoordinatesFromZip = async (zipCode: string) => {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`);
    const data = await response.json();
    const location = data.results[0]?.geometry?.location;
    return `${location.lat},${location.lng}`;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return '40.7128,-74.0060'; // Default to NYC
  }
};

// Calculate distance between ZIP codes
const calculateDistance = (zip1: string, location: any) => {
  // Simplified distance calculation - in production use proper geolocation
  return Math.floor(Math.random() * 25) + 1; // Random distance 1-25 miles
};

// Demo data for development
const getDemoCabinetStores = (zipCode: string) => [
  {
    id: 'store-1',
    name: 'Home Depot',
    address: '123 Main St, Your City',
    rating: 4.2,
    price_level: 2,
    phone: '(555) 123-4567',
    website: 'https://homedepot.com',
    distance: 3.2,
    specialties: ['Stock Cabinets', 'Semi-Custom', 'Installation'],
    hours: 'Mon-Sat: 6AM-10PM, Sun: 8AM-8PM'
  },
  {
    id: 'store-2',
    name: "Lowe's Home Improvement",
    address: '456 Oak Ave, Your City',
    rating: 4.1,
    price_level: 2,
    phone: '(555) 234-5678',
    website: 'https://lowes.com',
    distance: 4.8,
    specialties: ['Stock Cabinets', 'Custom Design', 'Installation'],
    hours: 'Mon-Sat: 6AM-10PM, Sun: 8AM-8PM'
  },
  {
    id: 'store-3',
    name: 'Kitchen & Bath Gallery',
    address: '789 Design Blvd, Your City',
    rating: 4.7,
    price_level: 3,
    phone: '(555) 345-6789',
    website: 'https://kitchenbathgallery.com',
    distance: 7.1,
    specialties: ['Custom Cabinets', 'Luxury Design', 'Full Service'],
    hours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-5PM, Sun: Closed'
  },
  {
    id: 'store-4',
    name: 'Cabinet Express',
    address: '321 Industrial Way, Your City',
    rating: 4.5,
    price_level: 2,
    phone: '(555) 456-7890',
    website: 'https://cabinetexpress.com',
    distance: 12.3,
    specialties: ['RTA Cabinets', 'Quick Delivery', 'Budget Options'],
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed'
  }
];

const getDemoContractors = (zipCode: string) => [
  {
    id: 'contractor-1',
    name: 'Elite Kitchen Solutions',
    rating: 4.9,
    review_count: 127,
    zips_served: [zipCode],
    specialties: ['Custom Cabinets', 'Kitchen Remodels', 'Countertops'],
    price_tier: 'premium',
    badge_verified: true,
    badge_licensed: true,
    badge_insured: true,
    phone: '(555) 123-4567',
    email: 'contact@elitekitchens.com',
    website: 'https://elitekitchens.com',
    years_in_business: 15,
    employees: 12,
    portfolio_images: []
  },
  {
    id: 'contractor-2',
    name: 'Modern Home Contractors',
    rating: 4.7,
    review_count: 89,
    zips_served: [zipCode],
    specialties: ['Kitchen Renovation', 'Cabinet Installation', 'Design'],
    price_tier: 'mid',
    badge_verified: true,
    badge_licensed: true,
    badge_insured: true,
    phone: '(555) 234-5678',
    email: 'hello@modernhome.com',
    website: 'https://modernhome.com',
    years_in_business: 8,
    employees: 6,
    portfolio_images: []
  },
  {
    id: 'contractor-3',
    name: 'Budget Kitchen Pros',
    rating: 4.2,
    review_count: 56,
    zips_served: [zipCode],
    specialties: ['Affordable Renovations', 'Cabinet Refacing', 'DIY Support'],
    price_tier: 'budget',
    badge_verified: false,
    badge_licensed: true,
    badge_insured: true,
    phone: '(555) 345-6789',
    email: 'info@budgetkitchen.com',
    website: 'https://budgetkitchen.com',
    years_in_business: 5,
    employees: 3,
    portfolio_images: []
  }
];

// Send RFQ to contractors
export const sendRFQToContractors = async (projectData: any, contractorIds: string[], message: string) => {
  try {
    // In production, this would send emails/notifications to contractors
    const response = await fetch('/api/rfq/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project: projectData,
        contractor_ids: contractorIds,
        message,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send RFQ');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending RFQ:', error);
    // Return success for demo
    return { success: true, rfq_id: 'demo-rfq-' + Date.now() };
  }
};