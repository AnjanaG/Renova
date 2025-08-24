import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { KitchenRenderer } from '../KitchenRenderer';
import { calculateEstimate } from '../../lib/supabase';
import { Palette, Settings, Eye, Lightbulb, Sparkles } from 'lucide-react';

interface DesignerStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  projectData: any;
  initialData?: any;
}

export const DesignerStep: React.FC<DesignerStepProps> = ({ 
  onNext, 
  onBack, 
  projectData, 
  initialData 
}) => {
  const [style, setStyle] = useState(initialData?.cabinet_style || 'shaker');
  const [material, setMaterial] = useState(initialData?.cabinet_material || 'plywood');
  const [hardware, setHardware] = useState(initialData?.hardware_type || 'brushed-nickel');
  const [upperPercentage, setUpperPercentage] = useState(initialData?.upper_percentage || 60);
  const [designOptions, setDesignOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [cabinetColor, setCabinetColor] = useState(initialData?.cabinet_color || 'white');
  const [activeDesign, setActiveDesign] = useState<number>(0);
  const [estimate, setEstimate] = useState<any>(null);

  const styles = [
    { id: 'shaker', name: 'Shaker', description: 'Classic and timeless', premium: 0 },
    { id: 'raised-panel', name: 'Raised Panel', description: 'Traditional elegance', premium: 25 },
    { id: 'flat-panel', name: 'Flat Panel', description: 'Clean and contemporary', premium: -10 },
    { id: 'modern', name: 'Modern', description: 'Sleek and minimalist', premium: 35 }
  ];

  const materials = [
    { id: 'mdf', name: 'MDF', description: 'Budget-friendly painted finish', cost: 'Budget' },
    { id: 'plywood', name: 'Plywood', description: 'Durable and versatile', cost: 'Mid-Range' },
    { id: 'solid-wood', name: 'Solid Wood', description: 'Premium natural beauty', cost: 'Premium' }
  ];

  const hardwareOptions = [
    { id: 'brushed-nickel', name: 'Brushed Nickel', description: 'Popular and versatile' },
    { id: 'matte-black', name: 'Matte Black', description: 'Modern and bold' },
    { id: 'brass', name: 'Brass', description: 'Warm and luxurious' },
    { id: 'chrome', name: 'Chrome', description: 'Classic and bright' }
  ];

  const cabinetColors = [
    { id: 'white', name: 'Classic White', hex: '#F8F9FA', premium: 0 },
    { id: 'cream', name: 'Warm Cream', hex: '#F5F5DC', premium: 5 },
    { id: 'gray', name: 'Modern Gray', hex: '#6C757D', premium: 10 },
    { id: 'navy', name: 'Navy Blue', hex: '#1B365D', premium: 15 },
    { id: 'sage', name: 'Sage Green', hex: '#87A96B', premium: 15 },
    { id: 'charcoal', name: 'Charcoal', hex: '#36454F', premium: 20 },
    { id: 'natural', name: 'Natural Wood', hex: '#D2B48C', premium: 25 },
    { id: 'espresso', name: 'Espresso', hex: '#3C2415', premium: 30 }
  ];

  // Generate design options based on user preferences
  useEffect(() => {
    if (projectData) {
      const options = generateTwoDesignOptions(projectData);
      setDesignOptions(options);
    }
  }, [projectData]);

  const generateTwoDesignOptions = (data: any) => {
    // Generate exactly 2 contrasting design options based on user preferences
    const option1 = {
      id: 1,
      name: data.design_style === 'modern' ? 'Sleek Modern' : 'Classic Elegance',
      style: data.design_style === 'modern' ? 'flat-panel' : 'shaker',
      material: data.budget_range === 'under-25k' ? 'mdf' : 'plywood',
      hardware: data.design_style === 'modern' ? 'matte-black' : 'brushed-nickel',
      color: data.design_style === 'modern' ? 'gray' : 'white',
      description: data.design_style === 'modern' ? 
        'Clean lines with contemporary appeal' : 
        'Timeless design with classic styling',
      features: data.design_style === 'modern' ? 
        ['Handle-less design', 'Integrated appliances', 'LED strip lighting'] :
        ['Soft-close drawers', 'Crown molding', 'Under-cabinet lighting'],
      suitability: data.design_style === 'modern' ? 
        'Perfect for contemporary and minimalist homes' :
        'Ideal for traditional and transitional styles'
    };

    const option2 = {
      id: 2,
      name: data.design_style === 'modern' ? 'Warm Contemporary' : 'Modern Transitional',
      style: data.design_style === 'modern' ? 'modern' : 'flat-panel',
      material: data.budget_range === 'over-100k' ? 'solid-wood' : 'plywood',
      hardware: data.design_style === 'modern' ? 'brass' : 'matte-black',
      color: data.design_style === 'modern' ? 'natural' : 'navy',
      description: data.design_style === 'modern' ? 
        'Modern design with warm natural elements' : 
        'Traditional meets contemporary styling',
      features: data.design_style === 'modern' ? 
        ['Natural wood grain', 'Brass accents', 'Statement lighting'] :
        ['Bold color choice', 'Mixed materials', 'Contemporary hardware'],
      suitability: data.design_style === 'modern' ? 
        'Great for those who want modern with warmth' :
        'Perfect for updating traditional spaces'
    };

    return [option1, option2];
  };

  const generateAlternativeOptions = (data: any) => {
    // Fallback options if user preferences don't generate good contrasts
    return [
      {
        id: 1,
        name: 'Timeless White',
        style: 'shaker',
        material: 'plywood',
        hardware: 'brushed-nickel',
        color: 'white',
        description: 'Clean, classic design that never goes out of style',
        features: ['Soft-close drawers', 'Crown molding', 'Under-cabinet lighting'],
        suitability: 'Works with any home style and increases resale value'
      },
      {
        id: 2,
        name: 'Bold Contemporary',
        style: 'flat-panel',
        material: 'plywood',
        hardware: 'matte-black',
        color: 'charcoal',
        description: 'Modern design with dramatic dark cabinets',
        features: ['Sleek hardware', 'Integrated lighting', 'Minimalist design'],
        suitability: 'Perfect for contemporary homes and bold personalities'
      }
    ];
  };

  useEffect(() => {
    if (projectData?.linear_footage) {
      const currentOption = selectedOption >= 0 ? designOptions[selectedOption] : null;
      const currentStyle = currentOption?.style || style;
      const currentMaterial = currentOption?.material || material;
      const currentColor = currentOption?.color || cabinetColor;
      const est = calculateEstimate(projectData.linear_footage, currentStyle, currentMaterial, currentColor);
      setEstimate(est);
    }
  }, [projectData, style, material, cabinetColor, designOptions, selectedOption]);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setActiveDesign(index);
    const option = designOptions[index];
    setStyle(option.style);
    setMaterial(option.material);
    setHardware(option.hardware);
    setCabinetColor(option.color);
  };

  const handleColorChange = (colorId: string) => {
    setCabinetColor(colorId);
    // If a design option is selected, update it
    if (selectedOption >= 0) {
      const updatedOptions = [...designOptions];
      updatedOptions[selectedOption] = { ...updatedOptions[selectedOption], color: colorId };
      setDesignOptions(updatedOptions);
    }
  };

  const handleNext = () => {
    const currentOption = selectedOption >= 0 ? designOptions[selectedOption] : null;
    onNext({
      cabinet_style: currentOption?.style || style,
      cabinet_material: currentOption?.material || material,
      hardware_type: currentOption?.hardware || hardware,
      cabinet_color: currentOption?.color || cabinetColor,
      upper_percentage: upperPercentage,
      selected_design_option: currentOption,
      active_design: activeDesign,
      estimate
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <Sparkles className="w-16 h-16 mx-auto text-purple-500" />
        <h2 className="text-3xl font-bold text-gray-800">Your Custom Kitchen Designs</h2>
        <p className="text-lg text-gray-600">Two personalized options based on your space and style preferences</p>
      </div>

      {/* Two Design Options */}
      {designOptions.length > 0 && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {designOptions.map((option, index) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="space-y-4"
              >
                {/* Design Option Card */}
                <Card
                  hover
                  onClick={() => handleOptionSelect(index)}
                  className={`p-6 cursor-pointer transition-all ${
                    activeDesign === index
                      ? 'ring-2 ring-purple-500 bg-purple-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-6">
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Lightbulb className="w-6 h-6 text-purple-500" />
                        <h4 className="text-2xl font-bold text-gray-800">{option.name}</h4>
                      </div>
                      <p className="text-gray-600 text-lg">{option.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Style:</span>
                        <span className="font-semibold">{styles.find(s => s.id === option.style)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Material:</span>
                        <span className="font-semibold">{materials.find(m => m.id === option.material)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hardware:</span>
                        <span className="font-semibold">{hardwareOptions.find(h => h.id === option.hardware)?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Color:</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: cabinetColors.find(c => c.id === option.color)?.hex }}
                          />
                          <span className="font-semibold">{cabinetColors.find(c => c.id === option.color)?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Key Features:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {option.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium">{option.suitability}</p>
                    </div>
                    
                    {activeDesign === index && (
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">Currently Viewing</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Kitchen Renderer */}
      {designOptions.length > 0 && (
        <KitchenRenderer
          dimensions={{
            width: projectData.room_width,
            length: projectData.room_length,
            height: projectData.room_height,
            layout: projectData.layout_type
          }}
          design={{
            style: designOptions[activeDesign]?.style || style,
            material: designOptions[activeDesign]?.material || material,
            color: designOptions[activeDesign]?.color || cabinetColor,
            hardware: designOptions[activeDesign]?.hardware || hardware
          }}
          onColorChange={handleColorChange}
        />
      )}

      {/* Live Preview & Estimate */}
      {estimate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Your Design Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Style:</span>
                <span className="font-medium">{styles.find(s => s.id === (designOptions[activeDesign]?.style || style))?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium">{materials.find(m => m.id === (designOptions[activeDesign]?.material || material))?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hardware:</span>
                <span className="font-medium">{hardwareOptions.find(h => h.id === (designOptions[activeDesign]?.hardware || hardware))?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Color:</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: cabinetColors.find(c => c.id === (designOptions[activeDesign]?.color || cabinetColor))?.hex }}
                  />
                  <span className="font-medium">{cabinetColors.find(c => c.id === (designOptions[activeDesign]?.color || cabinetColor))?.name}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Linear Footage:</span>
                <span className="font-medium">{projectData.linear_footage} ft</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cost Estimate Range</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-green-800">Budget Option</span>
                  <p className="text-xs text-green-600">Good quality, value-focused</p>
                </div>
                <span className="text-lg font-bold text-green-800">
                  ${estimate.total_low.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-blue-800">Most Popular</span>
                  <p className="text-xs text-blue-600">Great balance of quality & price</p>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  ${estimate.total_med.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-purple-800">Premium</span>
                  <p className="text-xs text-purple-600">Highest quality materials</p>
                </div>
                <span className="text-lg font-bold text-purple-800">
                  ${estimate.total_high.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          Back to Planning
        </Button>
        <Button onClick={handleNext} size="lg">
          Next: Get Your Quote
        </Button>
      </div>
    </motion.div>
  );
};