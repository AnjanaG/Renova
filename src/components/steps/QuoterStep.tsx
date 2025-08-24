import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calculator, DollarSign, TrendingUp, Shield } from 'lucide-react';

interface QuoterStepProps {
  onNext: () => void;
  onBack: () => void;
  projectData: any;
}

export const QuoterStep: React.FC<QuoterStepProps> = ({ onNext, onBack, projectData }) => {
  const { estimate } = projectData;
  
  if (!estimate) {
    return <div>Loading estimate...</div>;
  }

  const breakdown = [
    {
      category: 'Cabinets',
      low: estimate.cabinet_cost_low,
      med: estimate.cabinet_cost_med,
      high: estimate.cabinet_cost_high,
      description: 'Cabinet boxes, doors, drawers, and hardware'
    },
    {
      category: 'Installation',
      low: estimate.labor_cost_low,
      med: estimate.labor_cost_med,
      high: estimate.labor_cost_high,
      description: 'Professional installation and setup'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <Calculator className="w-16 h-16 mx-auto text-emerald-500" />
        <h2 className="text-3xl font-bold text-gray-800">Your Personalized Quote</h2>
        <p className="text-lg text-gray-600">
          Based on your {projectData.linear_footage}ft {projectData.layout_type.replace('-', ' ')} kitchen
        </p>
      </div>

      {/* Price Range Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-800">Budget Option</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${estimate.total_low.toLocaleString()}
              </p>
              <p className="text-sm text-green-700 mt-2">Good quality, value-focused</p>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• MDF construction</li>
              <li>• Standard hardware</li>
              <li>• Basic installation</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 border-2 border-blue-200 bg-blue-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg">
            Most Popular
          </div>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-800">Recommended</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${estimate.total_med.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700 mt-2">Perfect balance of quality & price</p>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Plywood construction</li>
              <li>• Quality hardware</li>
              <li>• Professional installation</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 border-2 border-purple-200 bg-purple-50">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-800">Premium</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ${estimate.total_high.toLocaleString()}
              </p>
              <p className="text-sm text-purple-700 mt-2">Highest quality materials</p>
            </div>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Solid wood construction</li>
              <li>• Premium hardware</li>
              <li>• Expert installation</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Cost Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Category</th>
                <th className="text-center py-3 font-semibold text-green-700">Budget</th>
                <th className="text-center py-3 font-semibold text-blue-700">Recommended</th>
                <th className="text-center py-3 font-semibold text-purple-700">Premium</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4">
                    <div>
                      <div className="font-medium text-gray-800">{item.category}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </td>
                  <td className="text-center py-4 font-medium text-green-600">
                    ${item.low.toLocaleString()}
                  </td>
                  <td className="text-center py-4 font-medium text-blue-600">
                    ${item.med.toLocaleString()}
                  </td>
                  <td className="text-center py-4 font-medium text-purple-600">
                    ${item.high.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-4">
                  <div>
                    <div className="font-medium text-gray-800">Contingency (15%)</div>
                    <div className="text-sm text-gray-600">Recommended buffer for unexpected costs</div>
                  </div>
                </td>
                <td className="text-center py-4 font-medium text-green-600">
                  ${Math.round((estimate.cabinet_cost_low + estimate.labor_cost_low) * 0.15).toLocaleString()}
                </td>
                <td className="text-center py-4 font-medium text-blue-600">
                  ${Math.round((estimate.cabinet_cost_med + estimate.labor_cost_med) * 0.15).toLocaleString()}
                </td>
                <td className="text-center py-4 font-medium text-purple-600">
                  ${Math.round((estimate.cabinet_cost_high + estimate.labor_cost_high) * 0.15).toLocaleString()}
                </td>
              </tr>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                <td className="py-4 font-bold text-gray-800 text-lg">Total Project Cost</td>
                <td className="text-center py-4 font-bold text-green-600 text-lg">
                  ${estimate.total_low.toLocaleString()}
                </td>
                <td className="text-center py-4 font-bold text-blue-600 text-lg">
                  ${estimate.total_med.toLocaleString()}
                </td>
                <td className="text-center py-4 font-bold text-purple-600 text-lg">
                  ${estimate.total_high.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* What's Included */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">What's Included in Your Quote</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Cabinet Package:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Cabinet boxes and doors
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Drawers with soft-close slides
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Hardware (knobs and pulls)
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Interior organizers
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Installation Services:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Professional installation
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Old cabinet removal
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Basic electrical adjustments
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Cleanup and disposal
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          Back to Design
        </Button>
        <Button onClick={onNext} size="lg">
          Find Contractors
        </Button>
      </div>
    </motion.div>
  );
};