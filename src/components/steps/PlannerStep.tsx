import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { calculateLinearFootage } from '../../lib/supabase';
import { 
  Home, 
  Ruler, 
  Upload, 
  Camera, 
  Zap, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface PlannerStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

interface AnalyzedDimensions {
  width: number;
  length: number;
  height: number;
  layout: string;
  confidence: number;
}

export const PlannerStep: React.FC<PlannerStepProps> = ({ onNext, initialData }) => {
  const [inputMethod, setInputMethod] = useState<'upload' | 'manual'>('upload');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzedDimensions | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Manual input fields
  const [width, setWidth] = useState(initialData?.room_width?.toString() || '');
  const [length, setLength] = useState(initialData?.room_length?.toString() || '');
  const [height, setHeight] = useState(initialData?.room_height?.toString() || '8');
  const [layout, setLayout] = useState(initialData?.layout_type || 'l-shape');
  
  // Design questions
  const [cookingStyle, setCookingStyle] = useState(initialData?.cooking_style || '');
  const [householdSize, setHouseholdSize] = useState(initialData?.household_size || '');
  const [entertainingFreq, setEntertainingFreq] = useState(initialData?.entertaining_frequency || '');
  const [storageNeeds, setStorageNeeds] = useState(initialData?.storage_needs || '');
  const [budgetRange, setBudgetRange] = useState(initialData?.budget_range || '');
  const [designStyle, setDesignStyle] = useState(initialData?.design_style || '');
  const [currentIssues, setCurrentIssues] = useState<string[]>(initialData?.current_issues || []);
  
  const [linearFootage, setLinearFootage] = useState(0);

  const layouts = [
    { id: 'galley', name: 'Galley', description: 'Two parallel counters' },
    { id: 'l-shape', name: 'L-Shape', description: 'Corner configuration' },
    { id: 'u-shape', name: 'U-Shape', description: 'Three-wall layout' },
    { id: 'island', name: 'Island', description: 'Additional island space' },
    { id: 'peninsula', name: 'Peninsula', description: 'Connected island' },
    { id: 'one-wall', name: 'One Wall', description: 'Single wall layout' }
  ];

  const cookingStyles = [
    { id: 'casual', name: 'Casual Cooking', description: 'Simple meals, reheating' },
    { id: 'regular', name: 'Regular Cooking', description: 'Daily home cooking' },
    { id: 'gourmet', name: 'Gourmet Cooking', description: 'Complex meals, baking' },
    { id: 'entertaining', name: 'Entertaining', description: 'Frequent hosting' }
  ];

  const designStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean lines, minimalist' },
    { id: 'traditional', name: 'Traditional', description: 'Classic, timeless' },
    { id: 'transitional', name: 'Transitional', description: 'Mix of modern & traditional' },
    { id: 'farmhouse', name: 'Farmhouse', description: 'Rustic, cozy' },
    { id: 'industrial', name: 'Industrial', description: 'Raw materials, urban' },
    { id: 'scandinavian', name: 'Scandinavian', description: 'Light, functional' }
  ];

  const commonIssues = [
    'Not enough storage',
    'Poor lighting',
    'Outdated appliances',
    'Limited counter space',
    'Poor workflow',
    'Cramped feeling',
    'Lack of seating',
    'Poor ventilation'
  ];

  useEffect(() => {
    const currentWidth = analysisResult?.width || parseFloat(width);
    const currentLength = analysisResult?.length || parseFloat(length);
    const currentLayout = analysisResult?.layout || layout;
    
    if (currentWidth && currentLength && currentLayout) {
      const lf = calculateLinearFootage(currentWidth, currentLength, currentLayout);
      setLinearFootage(lf);
    }
  }, [width, length, layout, analysisResult]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeImages = async () => {
    if (uploadedImages.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Simulate AI image analysis (in real app, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis result
      const mockResult: AnalyzedDimensions = {
        width: 12 + Math.random() * 8,
        length: 14 + Math.random() * 6,
        height: 8 + Math.random() * 2,
        layout: layouts[Math.floor(Math.random() * layouts.length)].id,
        confidence: 0.75 + Math.random() * 0.25 // Random confidence between 75-100%
      };
      
      setAnalysisResult(mockResult);
    } catch (error) {
      setAnalysisError('Failed to analyze images. Please try manual input or upload clearer photos.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleIssueToggle = (issue: string) => {
    setCurrentIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const handleNext = () => {
    const finalWidth = analysisResult?.width || parseFloat(width);
    const finalLength = analysisResult?.length || parseFloat(length);
    const finalHeight = analysisResult?.height || parseFloat(height);
    const finalLayout = analysisResult?.layout || layout;
    
    if (!finalWidth || !finalLength || !finalHeight) return;
    
    onNext({
      room_width: finalWidth,
      room_length: finalLength,
      room_height: finalHeight,
      layout_type: finalLayout,
      linear_footage: linearFootage,
      cooking_style: cookingStyle,
      household_size: householdSize,
      entertaining_frequency: entertainingFreq,
      storage_needs: storageNeeds,
      budget_range: budgetRange,
      design_style: designStyle,
      current_issues: currentIssues,
      analysis_confidence: analysisResult?.confidence,
      input_method: inputMethod
    });
  };

  const isFormValid = () => {
    const hasDimensions = analysisResult || (width && length && height);
    const hasDesignInfo = cookingStyle && householdSize && designStyle;
    return hasDimensions && hasDesignInfo;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <Home className="w-16 h-16 mx-auto text-blue-500" />
        <h2 className="text-3xl font-bold text-gray-800">Let's Plan Your Kitchen</h2>
        <p className="text-lg text-gray-600">Upload photos or enter dimensions, then tell us about your needs</p>
      </div>

      {/* Input Method Selection */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">How would you like to start?</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              hover
              onClick={() => setInputMethod('upload')}
              className={`p-8 cursor-pointer transition-all h-64 flex flex-col justify-center ${
                inputMethod === 'upload'
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-center space-y-4">
                <Camera className="w-12 h-12 mx-auto text-blue-500" />
                <h4 className="text-lg font-semibold text-gray-800">Upload Kitchen Photos</h4>
                <p className="text-gray-600 text-sm">AI will analyze your photos to understand dimensions and layout</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                  <Zap className="w-4 h-4" />
                  <span>Powered by AI</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              hover
              onClick={() => setInputMethod('manual')}
              className={`p-8 cursor-pointer transition-all h-64 flex flex-col justify-center ${
                inputMethod === 'manual'
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-center space-y-4">
                <Ruler className="w-12 h-12 mx-auto text-green-500" />
                <h4 className="text-lg font-semibold text-gray-800">Enter Dimensions Manually</h4>
                <p className="text-gray-600 text-sm">Input your kitchen measurements directly</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Quick & Precise</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Inline Photo Upload for Upload Method */}
        {inputMethod === 'upload' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6 max-w-2xl mx-auto"
          >
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-blue-50/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload-inline"
              />
              <label htmlFor="photo-upload-inline" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-blue-500 mb-3" />
                <p className="text-base font-medium text-gray-700 mb-1">
                  Drop photos here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  Upload multiple angles for better analysis
                </p>
              </label>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Kitchen ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Analyze Button */}
                {!analysisResult && (
                  <div className="text-center">
                    <Button
                      onClick={analyzeImages}
                      disabled={isAnalyzing}
                      size="md"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing Photos...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Analysis Result */}
                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${
                      analysisResult.confidence >= 0.95 
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {analysisResult.confidence >= 0.95 ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {analysisResult.confidence >= 0.95 ? 'Analysis Complete!' : 'Analysis Complete - Please Verify'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Confidence: {Math.round(analysisResult.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    {analysisResult.confidence >= 0.95 ? (
                      // High confidence - show read-only results
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Width:</span>
                          <span className="font-medium ml-1">{analysisResult.width.toFixed(1)}ft</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Length:</span>
                          <span className="font-medium ml-1">{analysisResult.length.toFixed(1)}ft</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Height:</span>
                          <span className="font-medium ml-1">{analysisResult.height.toFixed(1)}ft</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Layout:</span>
                          <span className="font-medium ml-1">
                            {layouts.find(l => l.id === analysisResult.layout)?.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Low confidence - allow editing
                      <div className="space-y-4">
                        <p className="text-sm text-yellow-700 mb-4">
                          The AI analysis has moderate confidence. Please verify and adjust the dimensions if needed:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <Input
                            label="Width (ft)"
                            type="number"
                            value={analysisResult.width.toFixed(1)}
                            onChange={(value) => setAnalysisResult(prev => prev ? {...prev, width: parseFloat(value) || prev.width} : null)}
                            min={6}
                            max={30}
                            step={0.5}
                          />
                          <Input
                            label="Length (ft)"
                            type="number"
                            value={analysisResult.length.toFixed(1)}
                            onChange={(value) => setAnalysisResult(prev => prev ? {...prev, length: parseFloat(value) || prev.length} : null)}
                            min={6}
                            max={30}
                            step={0.5}
                          />
                          <Input
                            label="Height (ft)"
                            type="number"
                            value={analysisResult.height.toFixed(1)}
                            onChange={(value) => setAnalysisResult(prev => prev ? {...prev, height: parseFloat(value) || prev.height} : null)}
                            min={7}
                            max={12}
                            step={0.5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Layout Type
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {layouts.map((layoutOption) => (
                              <motion.div
                                key={layoutOption.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card
                                  hover
                                  onClick={() => setAnalysisResult(prev => prev ? {...prev, layout: layoutOption.id} : null)}
                                  className={`p-3 cursor-pointer transition-all text-sm ${
                                    analysisResult.layout === layoutOption.id
                                      ? 'ring-2 ring-blue-500 bg-blue-50'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <h4 className="font-semibold text-gray-800 text-sm">{layoutOption.name}</h4>
                                  <p className="text-xs text-gray-600">{layoutOption.description}</p>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Analysis Error */}
                {analysisError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-700 text-sm">{analysisError}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </Card>

      {/* Manual Input Section */}
      {inputMethod === 'manual' && (
        <Card className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Room Dimensions</h3>
              
              <Input
                label="Width"
                type="number"
                value={width}
                onChange={setWidth}
                placeholder="Enter width"
                suffix="ft"
                min={6}
                max={30}
                step={0.5}
              />
              
              <Input
                label="Length"
                type="number"
                value={length}
                onChange={setLength}
                placeholder="Enter length"
                suffix="ft"
                min={6}
                max={30}
                step={0.5}
              />
              
              <Input
                label="Ceiling Height"
                type="number"
                value={height}
                onChange={setHeight}
                placeholder="8"
                suffix="ft"
                min={7}
                max={12}
                step={0.5}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Layout Type</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {layouts.map((layoutOption) => (
                  <motion.div
                    key={layoutOption.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      hover
                      onClick={() => setLayout(layoutOption.id)}
                      className={`p-4 cursor-pointer transition-all ${
                        layout === layoutOption.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-800">{layoutOption.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{layoutOption.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Design Questions */}
      {(analysisResult || (width && length)) && (
        <Card className="p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">Tell Us About Your Kitchen Needs</h3>
          
          <div className="space-y-8">
            {/* Cooking Style */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                How do you use your kitchen?
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {cookingStyles.map((style) => (
                  <Card
                    key={style.id}
                    hover
                    onClick={() => setCookingStyle(style.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      cookingStyle === style.id
                        ? 'ring-2 ring-purple-500 bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-800">{style.name}</h4>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Household Size & Budget */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Household Size
                </label>
                <select
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  <option value="">Select size</option>
                  <option value="1-2">1-2 people</option>
                  <option value="3-4">3-4 people</option>
                  <option value="5+">5+ people</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Entertaining Frequency
                </label>
                <select
                  value={entertainingFreq}
                  onChange={(e) => setEntertainingFreq(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  <option value="">Select frequency</option>
                  <option value="never">Never</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="regularly">Regularly</option>
                  <option value="frequently">Frequently</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  <option value="">Select budget</option>
                  <option value="under-25k">Under $25k</option>
                  <option value="25k-50k">$25k - $50k</option>
                  <option value="50k-75k">$50k - $75k</option>
                  <option value="75k-100k">$75k - $100k</option>
                  <option value="over-100k">Over $100k</option>
                </select>
              </div>
            </div>

            {/* Design Style */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                What's your preferred design style?
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {designStyles.map((style) => (
                  <Card
                    key={style.id}
                    hover
                    onClick={() => setDesignStyle(style.id)}
                    className={`p-4 cursor-pointer transition-all ${
                      designStyle === style.id
                        ? 'ring-2 ring-emerald-500 bg-emerald-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-800">{style.name}</h4>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Current Issues */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                What issues does your current kitchen have? (Select all that apply)
              </label>
              <div className="grid md:grid-cols-4 gap-3">
                {commonIssues.map((issue) => (
                  <div
                    key={issue}
                    onClick={() => handleIssueToggle(issue)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                      currentIssues.includes(issue)
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Linear Footage Display */}
      {linearFootage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
        >
          <div className="flex items-center space-x-3">
            <Ruler className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                Estimated Linear Footage: {linearFootage} ft
              </h4>
              <p className="text-gray-600">
                Based on your {layouts.find(l => l.id === (analysisResult?.layout || layout))?.name.toLowerCase()} kitchen layout
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!isFormValid()}
          size="lg"
        >
          Next: Generate Design Options
        </Button>
      </div>
    </motion.div>
  );
};