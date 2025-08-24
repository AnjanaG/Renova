import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Eye, Palette, Camera, Upload, X, CheckCircle, AlertCircle, Zap, RotateCcw, Home, Ruler, Lightbulb, Sparkles, Brain } from 'lucide-react';
import { analyzeKitchenPhotos, generateKitchenDesign, VisionAnalysisResult } from '../lib/aiServices';

interface KitchenRendererProps {
  dimensions: {
    width: number;
    length: number;
    height: number;
    layout: string;
  };
  design: {
    style: string;
    material: string;
    color: string;
    hardware: string;
  };
  onColorChange?: (color: string) => void;
  className?: string;
}

export const KitchenRenderer: React.FC<KitchenRendererProps> = ({
  dimensions,
  design,
  onColorChange,
  className = ''
}) => {
  const [selectedColor, setSelectedColor] = useState(design.color);
  const [currentDesignIndex, setCurrentDesignIndex] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<VisionAnalysisResult | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showAIInterface, setShowAIInterface] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const cabinetColors = [
    { id: 'white', name: 'Classic White', hex: '#FAFAFA', premium: 0 },
    { id: 'cream', name: 'Warm Cream', hex: '#F5F5DC', premium: 5 },
    { id: 'gray', name: 'Modern Gray', hex: '#8B9DC3', premium: 10 },
    { id: 'navy', name: 'Navy Blue', hex: '#2C3E50', premium: 15 },
    { id: 'sage', name: 'Sage Green', hex: '#9CAF88', premium: 15 },
    { id: 'charcoal', name: 'Charcoal', hex: '#36454F', premium: 20 },
    { id: 'natural', name: 'Natural Wood', hex: '#D2B48C', premium: 25 },
    { id: 'espresso', name: 'Espresso', hex: '#3C2415', premium: 30 }
  ];

  // Generate design options based on room size and layout
  const generateDesignOptions = () => {
    const roomSize = dimensions.width * dimensions.length;
    const isSmallRoom = roomSize < 100;
    const isMediumRoom = roomSize >= 100 && roomSize < 200;
    const isLargeRoom = roomSize >= 200;

    // Base design recommendations on room characteristics
    const baseOptions = [
      {
        id: 1,
        name: `${design.style.replace('-', ' ')} - Space Optimized`,
        description: isSmallRoom ? 'Maximizes storage in compact space' : 
                    isMediumRoom ? 'Balanced design for medium kitchen' : 
                    'Spacious layout with premium features',
        image: getDesignImage(dimensions.layout, selectedColor, design.style, 1),
        features: isSmallRoom ? 
          ['Tall cabinets for storage', 'Light colors to open space', 'Efficient workflow'] :
          isMediumRoom ?
          ['Island or peninsula option', 'Ample counter space', 'Good storage solutions'] :
          ['Large island possible', 'Premium appliance space', 'Multiple work zones'],
        suitability: `Perfect for ${Math.round(dimensions.width)}' × ${Math.round(dimensions.length)}' ${dimensions.layout.replace('-', ' ')} kitchen`
      },
      {
        id: 2,
        name: `${design.style.replace('-', ' ')} - Classic Layout`,
        description: 'Traditional approach optimized for your space',
        image: getDesignImage(dimensions.layout, selectedColor, design.style, 2),
        features: [
          'Standard cabinet heights',
          'Proven workflow triangle',
          'Timeless design approach'
        ],
        suitability: 'Reliable choice that works well in most homes'
      },
      {
        id: 3,
        name: `${design.style.replace('-', ' ')} - Modern Approach`,
        description: 'Contemporary design with latest trends',
        image: getDesignImage(dimensions.layout, selectedColor, design.style, 3),
        features: [
          'Clean, minimalist lines',
          'Integrated appliances',
          'Smart storage solutions'
        ],
        suitability: 'Great for those who love modern aesthetics'
      }
    ];

    return baseOptions;
  };

  const [designOptions, setDesignOptions] = useState(generateDesignOptions());

  // Update design options when color or dimensions change
  useEffect(() => {
    if (generatedImages.length > 0) {
      // Use AI-generated images if available
      const aiOptions = generatedImages.map((imageUrl, index) => ({
        id: index + 1,
        name: `AI Generated Design ${index + 1}`,
        description: `Custom design for your ${dimensions.layout.replace('-', ' ')} kitchen`,
        image: imageUrl,
        features: [
          'AI-optimized layout',
          'Custom color matching',
          'Space-specific design'
        ],
        suitability: `Tailored for your ${Math.round(dimensions.width)}' × ${Math.round(dimensions.length)}' space`
      }));
      setDesignOptions(aiOptions);
    } else {
      setDesignOptions(generateDesignOptions());
    }
  }, [selectedColor, dimensions, design.style, generatedImages]);

  function getDesignImage(layout: string, color: string, style: string, variant: number): string {
    const baseUrl = 'https://images.pexels.com/photos/';
    
    // Curated high-quality kitchen images organized by style and color
    const imageMap: { [key: string]: string[] } = {
      // White kitchens
      'white': [
        '2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
        '1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      // Gray kitchens
      'gray': [
        '2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800',
        '1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      // Dark/Navy kitchens
      'navy': [
        '2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=800',
        '1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      'charcoal': [
        '1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      // Natural/Wood kitchens
      'natural': [
        '1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      'cream': [
        '2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800',
        '1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=800',
        '2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    };

    const colorImages = imageMap[color] || imageMap['white'];
    const imageIndex = (variant - 1) % colorImages.length;
    
    return baseUrl + colorImages[imageIndex];
  }

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
    onColorChange?.(colorId);
    
    // Regenerate images with new color if we have AI capability
    if (generatedImages.length > 0) {
      handleGenerateDesigns();
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzePhotos = async () => {
    if (uploadedPhotos.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const analysis = await analyzeKitchenPhotos(uploadedPhotos);
      setVisionAnalysis(analysis);
      
      // Auto-generate designs based on analysis
      if (analysis.confidence > 0.7) {
        await handleGenerateDesigns();
      }
    } catch (error) {
      console.error('Error analyzing photos:', error);
      setAnalysisError('Failed to analyze photos. Please try again or check your API configuration.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDesigns = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const imageUrls = await generateKitchenDesign({
        style: design.style,
        color: selectedColor,
        layout: dimensions.layout,
        dimensions: {
          width: dimensions.width,
          length: dimensions.length
        },
        material: design.material,
        lighting: 'warm LED',
        angle: 'corner'
      });
      
      setGeneratedImages(imageUrls);
    } catch (error) {
      console.error('Error generating designs:', error);
      setGenerationError('Failed to generate designs. Please try again or check your API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Interface Modal */}
      {showAIInterface && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Brain className="w-8 h-8 mr-3 text-purple-500" />
                    AI Kitchen Analysis & Design
                  </h3>
                  <p className="text-slate-600 mt-2">Upload photos for AI analysis and custom design generation</p>
                </div>
                <button
                  onClick={() => setShowAIInterface(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Step 1: Photo Upload */}
                <div>
                  <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-indigo-500" />
                    Step 1: Upload Your Kitchen Photos
                  </h4>
                  <p className="text-slate-600 mb-4">
                    Upload multiple photos of your kitchen from different angles for AI analysis.
                  </p>
                  
                  <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-indigo-50/50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="ai-kitchen-photos"
                    />
                    <label htmlFor="ai-kitchen-photos" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-3" />
                      <p className="text-base font-medium text-slate-700 mb-1">
                        Upload kitchen photos for AI analysis
                      </p>
                      <p className="text-sm text-slate-500">
                        Multiple angles recommended for best results
                      </p>
                    </label>
                  </div>

                  {/* Photo Preview */}
                  {uploadedPhotos.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                        {uploadedPhotos.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Kitchen ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border-2 border-slate-200"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: AI Analysis */}
                {uploadedPhotos.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-500" />
                      Step 2: AI Analysis
                    </h4>
                    
                    {!visionAnalysis && (
                      <div className="text-center">
                        <Button
                          onClick={handleAnalyzePhotos}
                          disabled={isAnalyzing}
                          size="lg"
                          className="bg-gradient-to-r from-purple-500 to-indigo-600"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Analyzing Photos with AI...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              Analyze with AI Vision
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {analysisError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-red-700">{analysisError}</p>
                      </div>
                    )}

                    {visionAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <h4 className="font-semibold text-slate-800">AI Analysis Complete</h4>
                            <p className="text-sm text-slate-600">
                              Confidence: {Math.round(visionAnalysis.confidence * 100)}% • 
                              {visionAnalysis.features.cabinets.style} style detected
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">Detected Features:</h5>
                            <ul className="text-sm text-slate-600 space-y-1">
                              <li>Layout: {visionAnalysis.layout.replace('-', ' ')}</li>
                              <li>Cabinet Style: {visionAnalysis.features.cabinets.style}</li>
                              <li>Current Color: {visionAnalysis.features.cabinets.color}</li>
                              <li>Flooring: {visionAnalysis.features.flooring}</li>
                              <li>Appliances: {visionAnalysis.features.appliances.join(', ')}</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">AI Recommendations:</h5>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {visionAnalysis.recommendations.slice(0, 4).map((rec, idx) => (
                                <li key={idx} className="flex items-start">
                                  <Lightbulb className="w-3 h-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Step 3: Generate Custom Designs */}
                {visionAnalysis && (
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-pink-500" />
                      Step 3: Generate Custom Designs
                    </h4>
                    
                    <div className="text-center">
                      <Button
                        onClick={handleGenerateDesigns}
                        disabled={isGenerating}
                        size="lg"
                        className="bg-gradient-to-r from-pink-500 to-purple-600"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Generating AI Designs...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Custom Designs
                          </>
                        )}
                      </Button>
                    </div>

                    {generationError && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-red-700">{generationError}</p>
                      </div>
                    )}

                    {generatedImages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          <div>
                            <h4 className="font-semibold text-slate-800">Custom Designs Generated!</h4>
                            <p className="text-sm text-slate-600">
                              {generatedImages.length} unique designs created for your space
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {generatedImages.map((imageUrl, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={`AI Generated Design ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  <div className="text-sm text-slate-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Requires OpenAI API key for full functionality
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowAIInterface(false)}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Design Options Display */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50" variant="elevated">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">Design Options for Your Space</h3>
              <p className="text-sm text-slate-600">
                {Math.round(dimensions.width)}' × {Math.round(dimensions.length)}' {dimensions.layout.replace('-', ' ')} kitchen
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowAIInterface(true)}
              variant="secondary"
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </Button>
            <Button 
              onClick={() => setCurrentDesignIndex((prev) => (prev + 1) % designOptions.length)} 
              variant="outline" 
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Next Design
            </Button>
          </div>
        </div>
        
        {/* Design Options Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {designOptions.map((option, index) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all ${
                currentDesignIndex === index ? 'ring-3 ring-indigo-500 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setCurrentDesignIndex(index)}
            >
              <div className="aspect-[4/3] bg-slate-200 relative">
                <img
                  src={option.image}
                  alt={option.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.style.backgroundColor = cabinetColors.find(c => c.id === selectedColor)?.hex || '#FAFAFA';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-white font-semibold text-sm">{option.name}</h4>
                  <p className="text-white/80 text-xs mt-1">{option.description}</p>
                </div>
                {currentDesignIndex === index && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Current Design Display */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-200">
          <div className="aspect-[16/10] bg-slate-100 relative">
            <img
              src={designOptions[currentDesignIndex].image}
              alt={designOptions[currentDesignIndex].name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.style.backgroundColor = cabinetColors.find(c => c.id === selectedColor)?.hex || '#FAFAFA';
              }}
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3">
              <h4 className="font-semibold text-slate-800">{designOptions[currentDesignIndex].name}</h4>
              <p className="text-sm text-slate-600 mt-1">{designOptions[currentDesignIndex].description}</p>
              <p className="text-xs text-slate-500 mt-1">{designOptions[currentDesignIndex].suitability}</p>
            </div>
          </div>
        </div>

        {/* Design Features */}
        <div className="mt-4 p-4 bg-white/50 rounded-xl">
          <h5 className="font-medium text-slate-700 mb-2">Key Features:</h5>
          <div className="grid md:grid-cols-3 gap-2">
            {designOptions[currentDesignIndex].features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Room Analysis Status */}
        {visionAnalysis && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">
                AI analysis complete - designs optimized based on your photos
              </p>
              {generatedImages.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {generatedImages.length} custom AI-generated designs available
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Color Selector */}
      <Card className="p-6" variant="elevated">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Cabinet Colors</h4>
            <p className="text-sm text-slate-600">Choose your perfect cabinet finish</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {cabinetColors.map((color) => (
            <motion.div
              key={color.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleColorChange(color.id)}
              className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                selectedColor === color.id ? 'ring-3 ring-indigo-500 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <div
                className="w-full h-20 border border-slate-200"
                style={{ backgroundColor: color.hex }}
              />
              <div className="absolute inset-0 flex items-end">
                <div className="w-full bg-gradient-to-t from-black/60 to-transparent text-white text-xs p-2 text-center">
                  <div className="font-medium">{color.name}</div>
                  {color.premium > 0 && (
                    <div className="text-yellow-300">+{color.premium}%</div>
                  )}
                </div>
              </div>
              {selectedColor === color.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Kitchen Specs */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-indigo-50" variant="bordered">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{Math.round(dimensions.width)}' × {Math.round(dimensions.length)}'</div>
            <div className="text-slate-600">Dimensions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{dimensions.layout.replace('-', ' ')}</div>
            <div className="text-slate-600">Layout</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{design.style.replace('-', ' ')}</div>
            <div className="text-slate-600">Style</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{design.material}</div>
            <div className="text-slate-600">Material</div>
          </div>
        </div>
      </Card>
    </div>
  );
};