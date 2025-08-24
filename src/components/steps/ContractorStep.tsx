import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { findContractors, sendRFQToContractors } from '../../lib/apis';
import { MapPin, Star, Shield, Phone, Mail, Award, Send } from 'lucide-react';

interface ContractorStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  projectData: any;
}

export const ContractorStep: React.FC<ContractorStepProps> = ({ onNext, onBack, projectData }) => {
  const [zip, setZip] = useState('');
  const [contractors, setContractors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [rfqMessage, setRfqMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContractors = async () => {
      if (zip && zip.length === 5) {
        setIsLoading(true);
        setError(null);
        try {
          const contractorData = await findContractors(zip);
          setContractors(contractorData);
        } catch (err) {
          setError('Failed to load contractors. Please try again.');
          console.error('Error loading contractors:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadContractors();
  }, [zip]);

  const handleSendRFQ = async () => {
    if (selectedContractors.length === 0) return;
    
    setIsLoading(true);
    try {
      await sendRFQToContractors(projectData, selectedContractors, rfqMessage);
      
      const rfqData = {
        selectedContractors,
        message: rfqMessage,
        userZip: zip,
        contractors: contractors.filter(c => selectedContractors.includes(c.id))
      };
      
      onNext(rfqData);
    } catch (err) {
      setError('Failed to send RFQ. Please try again.');
      console.error('Error sending RFQ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractorSelect = (contractorId: string) => {
    setSelectedContractors(prev => 
      prev.includes(contractorId)
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    );
  };

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'budget': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <MapPin className="w-16 h-16 mx-auto text-emerald-500" />
        <h2 className="text-3xl font-bold text-gray-800">Find Trusted Contractors</h2>
        <p className="text-lg text-gray-600">Connect with pre-screened professionals in your area</p>
      </div>

      {/* ZIP Code Input */}
      <Card className="p-6">
        <div className="max-w-md mx-auto">
          <Input
            label="Enter your ZIP code to find contractors"
            type="text"
            value={zip}
            onChange={(value) => setZip(value.slice(0, 5))}
            placeholder="12345"
            className="text-center"
          />
        </div>
      </Card>

      {/* Contractors Grid */}
      {isLoading && (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding contractors in your area...</p>
        </Card>
      )}

      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {!isLoading && contractors.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {contractors.map((contractor) => (
            <motion.div
              key={contractor.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`p-6 cursor-pointer transition-all ${
                  selectedContractors.includes(contractor.id)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-xl'
                }`}
                onClick={() => handleContractorSelect(contractor.id)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{contractor.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium text-gray-700 ml-1">{contractor.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{contractor.review_count} reviews</span>
                        {contractor.years_in_business && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{contractor.years_in_business} years</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(contractor.price_tier)}`}>
                        {contractor.price_tier === 'premium' ? 'Premium' : 
                         contractor.price_tier === 'mid' ? 'Mid-Range' : 'Budget'}
                      </span>
                      {selectedContractors.includes(contractor.id) && (
                        <div className="mt-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex space-x-2">
                    {contractor.badge_verified && (
                      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                    {contractor.badge_licensed && (
                      <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Licensed
                      </div>
                    )}
                    {contractor.badge_insured && (
                      <div className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Insured
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {contractor.specialties.map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex space-x-4 pt-2">
                    {contractor.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {contractor.phone}
                      </div>
                    )}
                    {contractor.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        Available
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && contractors.length === 0 && zip.length === 5 && (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No contractors found in your area</h3>
          <p className="text-gray-600">Try expanding your search or check back later.</p>
        </Card>
      )}

      {/* Cabinet Stores Section */}
      {zip.length === 5 && (
        <CabinetStoresSection zipCode={zip} />
      )}

      {/* Selected Summary */}
      {selectedContractors.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ready to Request Quotes ({selectedContractors.length} selected)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to contractors (optional):
              </label>
              <textarea
                value={rfqMessage}
                onChange={(e) => setRfqMessage(e.target.value)}
                placeholder="Tell contractors about your project timeline, special requirements, or any questions you have..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                rows={4}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Your project details and estimate will be shared with selected contractors
              </p>
              <Button 
                onClick={handleSendRFQ} 
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send RFQ
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          Back to Quote
        </Button>
        {selectedContractors.length > 0 ? (
          <Button 
            onClick={handleSendRFQ} 
            disabled={isLoading}
            size="lg"
          >
            Review & Export
          </Button>
        ) : (
          <Button onClick={() => onNext({})} variant="outline" size="lg">
            Skip for Now
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Cabinet Stores Component
const CabinetStoresSection: React.FC<{ zipCode: string }> = ({ zipCode }) => {
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const { findCabinetStores } = await import('../../lib/apis');
        const storeData = await findCabinetStores(zipCode);
        setStores(storeData);
      } catch (error) {
        console.error('Error loading cabinet stores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, [zipCode]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Cabinet Stores Near You</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Cabinet Stores Near You</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {stores.map((store) => (
          <motion.div
            key={store.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 hover:shadow-lg transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{store.name}</h4>
                    <p className="text-sm text-gray-600">{store.address}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-700 ml-1">{store.rating}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{store.distance} miles</span>
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      store.price_level === 1 ? 'bg-green-100 text-green-800' :
                      store.price_level === 2 ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {'$'.repeat(store.price_level || 2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {store.specialties?.map((specialty: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{store.hours}</span>
                  {store.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {store.phone}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};