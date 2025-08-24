// AI Services for image generation and vision analysis
import { supabase } from './supabase';

// Types for AI services
export interface VisionAnalysisResult {
  confidence: number;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  layout: string;
  features: {
    cabinets: {
      style: string;
      color: string;
      condition: string;
    };
    appliances: string[];
    lighting: string[];
    flooring: string;
    walls: string;
    issues: string[];
  };
  recommendations: string[];
}

export interface ImageGenerationRequest {
  style: string;
  color: string;
  layout: string;
  dimensions: {
    width: number;
    length: number;
  };
  material: string;
  lighting?: string;
  angle?: 'corner' | 'straight' | 'overview' | 'island-focus';
}

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Replicate API configuration (alternative for image generation)
const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

// Stability AI configuration (another alternative)
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;

/**
 * Analyze kitchen photos using GPT-4 Vision
 */
export const analyzeKitchenPhotos = async (imageFiles: File[]): Promise<VisionAnalysisResult> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Convert images to base64
    const imagePromises = imageFiles.map(file => convertToBase64(file));
    const base64Images = await Promise.all(imagePromises);

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze these kitchen photos and provide detailed information about:
            1. Room dimensions (estimate width, length, height in feet)
            2. Kitchen layout type (galley, L-shape, U-shape, island, one-wall)
            3. Current cabinet style, color, and condition
            4. Existing appliances and their placement
            5. Lighting sources (natural and artificial)
            6. Flooring material and condition
            7. Wall color and condition
            8. Any issues or problems you notice
            9. Recommendations for improvement
            
            Please be specific and provide measurements where possible. Return confidence level (0-1) for your analysis.`
          },
          ...base64Images.map(base64 => ({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
              detail: 'high'
            }
          }))
        ]
      }
    ];

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages,
        max_tokens: 1500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the analysis text into structured data
    return parseVisionAnalysis(analysisText);

  } catch (error) {
    console.error('Error analyzing kitchen photos:', error);
    // Fallback to mock analysis
    return generateMockAnalysis();
  }
};

/**
 * Generate kitchen design images using DALL-E 3
 */
export const generateKitchenDesign = async (request: ImageGenerationRequest): Promise<string[]> => {
  if (!OPENAI_API_KEY) {
    // Fallback to other services or mock images
    return generateWithFallback(request);
  }

  try {
    const prompt = createImagePrompt(request);
    
    // Generate multiple variations
    const imagePromises = Array.from({ length: 3 }, (_, i) => 
      generateSingleImage(prompt, i)
    );

    const imageUrls = await Promise.all(imagePromises);
    return imageUrls.filter(url => url !== null) as string[];

  } catch (error) {
    console.error('Error generating kitchen designs:', error);
    return generateWithFallback(request);
  }
};

/**
 * Generate a single image with DALL-E 3
 */
const generateSingleImage = async (prompt: string, variation: number): Promise<string | null> => {
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt} (variation ${variation + 1})`,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      })
    });

    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;

  } catch (error) {
    console.error('Error generating single image:', error);
    return null;
  }
};

/**
 * Create detailed prompt for image generation
 */
const createImagePrompt = (request: ImageGenerationRequest): string => {
  const { style, color, layout, dimensions, material, lighting, angle } = request;
  
  const styleDescriptions = {
    'shaker': 'clean Shaker style with recessed panel doors',
    'raised-panel': 'traditional raised panel doors with decorative molding',
    'flat-panel': 'modern flat panel doors with clean lines',
    'modern': 'ultra-modern handleless cabinets with sleek surfaces'
  };

  const colorDescriptions = {
    'white': 'crisp white',
    'cream': 'warm cream',
    'gray': 'modern gray',
    'navy': 'deep navy blue',
    'sage': 'sage green',
    'charcoal': 'charcoal gray',
    'natural': 'natural wood grain',
    'espresso': 'rich espresso brown'
  };

  const layoutDescriptions = {
    'galley': 'galley layout with parallel counters',
    'l-shape': 'L-shaped layout with corner configuration',
    'u-shape': 'U-shaped layout with three walls of cabinets',
    'island': 'kitchen with large central island',
    'one-wall': 'single wall kitchen layout'
  };

  const angleDescriptions = {
    'corner': 'from a corner angle showing depth and dimension',
    'straight': 'straight-on view showing the main wall',
    'overview': 'elevated overview showing the entire layout',
    'island-focus': 'focused on the kitchen island as the centerpiece'
  };

  return `Professional architectural rendering of a modern kitchen interior with ${styleDescriptions[style as keyof typeof styleDescriptions]} cabinets in ${colorDescriptions[color as keyof typeof colorDescriptions]} finish. The kitchen features a ${layoutDescriptions[layout as keyof typeof layoutDescriptions]}, approximately ${dimensions.width} by ${dimensions.length} feet. ${material} construction with ${lighting || 'warm LED'} lighting. Shot ${angleDescriptions[angle as keyof typeof angleDescriptions] || 'from a corner angle'}. Photorealistic, high-end interior design, clean and bright, professional photography style, 4K quality.`;
};

/**
 * Fallback image generation using Replicate or Stability AI
 */
const generateWithFallback = async (request: ImageGenerationRequest): Promise<string[]> => {
  // Try Replicate first
  if (REPLICATE_API_KEY) {
    try {
      return await generateWithReplicate(request);
    } catch (error) {
      console.error('Replicate fallback failed:', error);
    }
  }

  // Try Stability AI
  if (STABILITY_API_KEY) {
    try {
      return await generateWithStability(request);
    } catch (error) {
      console.error('Stability AI fallback failed:', error);
    }
  }

  // Final fallback to curated stock images
  return getFallbackImages(request);
};

/**
 * Generate images using Replicate API
 */
const generateWithReplicate = async (request: ImageGenerationRequest): Promise<string[]> => {
  const prompt = createImagePrompt(request);
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      input: {
        prompt,
        width: 1024,
        height: 1024,
        num_outputs: 3,
        scheduler: 'K_EULER',
        num_inference_steps: 50,
        guidance_scale: 7.5
      }
    })
  });

  const prediction = await response.json();
  
  // Poll for completion
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` }
    });
    result = await pollResponse.json();
  }

  return result.output || [];
};

/**
 * Generate images using Stability AI
 */
const generateWithStability = async (request: ImageGenerationRequest): Promise<string[]> => {
  const prompt = createImagePrompt(request);
  
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STABILITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      samples: 3,
      steps: 30
    })
  });

  const data = await response.json();
  
  return data.artifacts?.map((artifact: any) => 
    `data:image/png;base64,${artifact.base64}`
  ) || [];
};

/**
 * Get fallback images from curated stock photos
 */
const getFallbackImages = (request: ImageGenerationRequest): string[] => {
  const { color, layout } = request;
  
  // Curated high-quality kitchen images organized by color and layout
  const imageMap: { [key: string]: string[] } = {
    'white-l-shape': [
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1024',
      'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1024',
      'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1024'
    ],
    'gray-modern': [
      'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=1024',
      'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1024',
      'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1024'
    ]
  };

  const key = `${color}-${layout}`;
  return imageMap[key] || imageMap['white-l-shape'] || [];
};

/**
 * Convert file to base64
 */
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Parse vision analysis text into structured data
 */
const parseVisionAnalysis = (analysisText: string): VisionAnalysisResult => {
  // This would parse the GPT-4 Vision response into structured data
  // For now, return a structured format based on the analysis
  
  // Extract confidence from text (look for confidence indicators)
  const confidenceMatch = analysisText.match(/confidence[:\s]+(\d+(?:\.\d+)?)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.85;

  // Extract dimensions (look for measurements)
  const widthMatch = analysisText.match(/width[:\s]+(\d+(?:\.\d+)?)/i);
  const lengthMatch = analysisText.match(/length[:\s]+(\d+(?:\.\d+)?)/i);
  const heightMatch = analysisText.match(/height[:\s]+(\d+(?:\.\d+)?)/i);

  return {
    confidence,
    dimensions: {
      width: widthMatch ? parseFloat(widthMatch[1]) : 12,
      length: lengthMatch ? parseFloat(lengthMatch[1]) : 14,
      height: heightMatch ? parseFloat(heightMatch[1]) : 8
    },
    layout: extractLayout(analysisText),
    features: {
      cabinets: {
        style: extractCabinetStyle(analysisText),
        color: extractCabinetColor(analysisText),
        condition: extractCondition(analysisText)
      },
      appliances: extractAppliances(analysisText),
      lighting: extractLighting(analysisText),
      flooring: extractFlooring(analysisText),
      walls: extractWallColor(analysisText),
      issues: extractIssues(analysisText)
    },
    recommendations: extractRecommendations(analysisText)
  };
};

/**
 * Generate mock analysis for fallback
 */
const generateMockAnalysis = (): VisionAnalysisResult => {
  return {
    confidence: 0.75,
    dimensions: {
      width: 12 + Math.random() * 6,
      length: 14 + Math.random() * 4,
      height: 8 + Math.random() * 2
    },
    layout: ['galley', 'l-shape', 'u-shape'][Math.floor(Math.random() * 3)],
    features: {
      cabinets: {
        style: 'shaker',
        color: 'white',
        condition: 'good'
      },
      appliances: ['refrigerator', 'dishwasher', 'range'],
      lighting: ['recessed', 'under-cabinet'],
      flooring: 'hardwood',
      walls: 'white',
      issues: ['limited storage', 'outdated hardware']
    },
    recommendations: [
      'Consider adding more upper cabinets for storage',
      'Update hardware for a modern look',
      'Add under-cabinet lighting for better task lighting'
    ]
  };
};

// Helper functions for parsing analysis text
const extractLayout = (text: string): string => {
  const layouts = ['galley', 'l-shape', 'u-shape', 'island', 'one-wall'];
  for (const layout of layouts) {
    if (text.toLowerCase().includes(layout)) return layout;
  }
  return 'l-shape';
};

const extractCabinetStyle = (text: string): string => {
  const styles = ['shaker', 'raised-panel', 'flat-panel', 'modern'];
  for (const style of styles) {
    if (text.toLowerCase().includes(style)) return style;
  }
  return 'shaker';
};

const extractCabinetColor = (text: string): string => {
  const colors = ['white', 'cream', 'gray', 'navy', 'sage', 'charcoal', 'natural', 'espresso'];
  for (const color of colors) {
    if (text.toLowerCase().includes(color)) return color;
  }
  return 'white';
};

const extractCondition = (text: string): string => {
  if (text.toLowerCase().includes('poor') || text.toLowerCase().includes('damaged')) return 'poor';
  if (text.toLowerCase().includes('fair') || text.toLowerCase().includes('worn')) return 'fair';
  return 'good';
};

const extractAppliances = (text: string): string[] => {
  const appliances = ['refrigerator', 'dishwasher', 'range', 'microwave', 'oven'];
  return appliances.filter(appliance => text.toLowerCase().includes(appliance));
};

const extractLighting = (text: string): string[] => {
  const lighting = ['recessed', 'pendant', 'under-cabinet', 'chandelier', 'track'];
  return lighting.filter(light => text.toLowerCase().includes(light));
};

const extractFlooring = (text: string): string => {
  const flooring = ['hardwood', 'tile', 'laminate', 'vinyl', 'stone'];
  for (const floor of flooring) {
    if (text.toLowerCase().includes(floor)) return floor;
  }
  return 'hardwood';
};

const extractWallColor = (text: string): string => {
  const colors = ['white', 'beige', 'gray', 'blue', 'green'];
  for (const color of colors) {
    if (text.toLowerCase().includes(`${color} wall`)) return color;
  }
  return 'white';
};

const extractIssues = (text: string): string[] => {
  const issues = [
    'limited storage', 'outdated hardware', 'poor lighting', 
    'cramped space', 'old appliances', 'worn countertops'
  ];
  return issues.filter(issue => 
    text.toLowerCase().includes(issue.toLowerCase())
  );
};

const extractRecommendations = (text: string): string[] => {
  // Extract recommendations from the analysis text
  const lines = text.split('\n');
  const recommendations = lines
    .filter(line => 
      line.toLowerCase().includes('recommend') || 
      line.toLowerCase().includes('suggest') ||
      line.toLowerCase().includes('consider')
    )
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  return recommendations.length > 0 ? recommendations : [
    'Consider updating cabinet hardware',
    'Add under-cabinet lighting',
    'Maximize storage with tall cabinets'
  ];
};