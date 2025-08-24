import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FileDown, Check, User, Home, Palette, Calculator, Users, Save } from 'lucide-react';
import { generatePDF } from '../../utils/pdfGenerator';

interface ReviewStepProps {
  onBack: () => void;
  onSave: (userData: any) => void;
  projectData: any;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ onBack, onSave, projectData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState(projectData.userZip || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProject = async () => {
    if (!name || !email) return;
    
    await onSave({
      name,
      email,
      zip
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDownloadPDF = () => {
    const userData = { name, email, zip };
    generatePDF(projectData, userData);
  };

  const sections = [
    {
      icon: Home,
      title: 'Room Planning',
      data: [
        `${projectData.room_width}' × ${projectData.room_length}' (${projectData.room_height}' ceiling)`,
        `${projectData.layout_type.replace('-', ' ')} layout`,
        `${projectData.linear_footage} linear feet`
      ]
    },
    {
      icon: Palette,
      title: 'Cabinet Design',
      data: [
        `${projectData.cabinet_style.replace('-', ' ')} style`,
        `${projectData.cabinet_material} material`,
        `${projectData.hardware_type.replace('-', ' ')} hardware`,
        `${projectData.upper_percentage}% upper cabinets`
      ]
    },
    {
      icon: Calculator,
      title: 'Cost Estimate',
      data: [
        `Budget: $${projectData.estimate.total_low.toLocaleString()}`,
        `Recommended: $${projectData.estimate.total_med.toLocaleString()}`,
        `Premium: $${projectData.estimate.total_high.toLocaleString()}`
      ]
    }
  ];

  if (projectData.selectedContractors?.length > 0) {
    sections.push({
      icon: Users,
      title: 'Contractor RFQs',
      data: [
        `${projectData.selectedContractors.length} contractors selected`,
        'RFQ sent successfully',
        'Expect responses within 2-3 business days'
      ]
    });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <Check className="w-16 h-16 mx-auto text-green-500" />
        <h2 className="text-3xl font-bold text-gray-800">Your Kitchen Plan is Complete!</h2>
        <p className="text-lg text-gray-600">Review your project and save for future reference</p>
      </div>

      {/* Project Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <section.icon className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
            </div>
            <ul className="space-y-2">
              {section.data.map((item, itemIndex) => (
                <li key={itemIndex} className="text-gray-600 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Save Project Form */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-800">Save Your Project</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Input
            label="Your Name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="John Smith"
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="john@example.com"
          />
          <Input
            label="ZIP Code"
            type="text"
            value={zip}
            onChange={(value) => setZip(value.slice(0, 5))}
            placeholder="12345"
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            We'll save your project so you can return anytime and track contractor responses
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={handleSaveProject}
              disabled={!name || !email || isSaved}
              variant="secondary"
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaved ? 'Saved!' : 'Save Project'}
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="flex items-center"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">What Happens Next?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <h4 className="font-semibold text-gray-800">Contractor Response</h4>
            <p className="text-sm text-gray-600">
              Selected contractors will review your project and send detailed quotes
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="font-bold text-green-600">2</span>
            </div>
            <h4 className="font-semibold text-gray-800">Compare Proposals</h4>
            <p className="text-sm text-gray-600">
              Review quotes, timelines, and contractor profiles to make your choice
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="font-bold text-purple-600">3</span>
            </div>
            <h4 className="font-semibold text-gray-800">Start Your Remodel</h4>
            <p className="text-sm text-gray-600">
              Work with your chosen contractor to bring your kitchen vision to life
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          Back to Contractors
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          size="lg"
        >
          Start New Project
        </Button>
      </div>
    </motion.div>
  );
};