import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, User, Building2, Eye, EyeOff, Mail, Lock, Phone, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

type AuthMode = 'signin' | 'signup';
type UserType = 'homeowner' | 'business';
type BusinessType = 'cabinet_shop' | 'contractor' | 'designer';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [userType, setUserType] = useState<UserType>('homeowner');
  const [businessType, setBusinessType] = useState<BusinessType>('contractor');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setZipCode('');
    setBusinessName('');
    setBusinessAddress('');
    setBusinessPhone('');
    setBusinessWebsite('');
    setYearsInBusiness('');
    setLicenseNumber('');
    setServiceAreas('');
    setError(null);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      onAuthSuccess({ ...data.user, profile });
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
            business_type: userType === 'business' ? businessType : null
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const profileData = {
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          zip_code: zipCode,
          user_type: userType,
          ...(userType === 'business' && {
            business_type: businessType,
            business_name: businessName,
            business_address: businessAddress,
            business_phone: businessPhone,
            business_website: businessWebsite,
            years_in_business: yearsInBusiness ? parseInt(yearsInBusiness) : null,
            license_number: licenseNumber,
            service_areas: serviceAreas.split(',').map(area => area.trim())
          })
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) throw profileError;

        onAuthSuccess({ ...data.user, profile: profileData });
        onClose();
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const businessTypes = [
    { id: 'contractor', name: 'General Contractor', description: 'Kitchen remodeling and construction' },
    { id: 'cabinet_shop', name: 'Cabinet Shop', description: 'Custom and semi-custom cabinets' },
    { id: 'designer', name: 'Kitchen Designer', description: 'Design consultation and planning' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                {mode === 'signin' ? 'Welcome Back' : 'Join Renova'}
              </h2>
              <p className="text-slate-600 mt-2">
                {mode === 'signin' 
                  ? 'Sign in to your account' 
                  : 'Create your account to get started'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); mode === 'signin' ? handleSignIn() : handleSignUp(); }}>
            {/* User Type Selection (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    hover
                    onClick={() => setUserType('homeowner')}
                    className={`p-6 cursor-pointer transition-all ${
                      userType === 'homeowner'
                        ? 'ring-2 ring-indigo-500 bg-indigo-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-center">
                      <User className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                      <h4 className="font-semibold text-slate-800">Homeowner</h4>
                      <p className="text-sm text-slate-600 mt-1">Planning a kitchen remodel</p>
                    </div>
                  </Card>
                  <Card
                    hover
                    onClick={() => setUserType('business')}
                    className={`p-6 cursor-pointer transition-all ${
                      userType === 'business'
                        ? 'ring-2 ring-indigo-500 bg-indigo-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-center">
                      <Building2 className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                      <h4 className="font-semibold text-slate-800">Business</h4>
                      <p className="text-sm text-slate-600 mt-1">Contractor, shop, or designer</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Business Type Selection */}
            {mode === 'signup' && userType === 'business' && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Business Type:
                </label>
                <div className="space-y-3">
                  {businessTypes.map((type) => (
                    <Card
                      key={type.id}
                      hover
                      onClick={() => setBusinessType(type.id as BusinessType)}
                      className={`p-4 cursor-pointer transition-all ${
                        businessType === type.id
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-purple-500 mr-3" />
                        <div>
                          <h4 className="font-semibold text-slate-800">{type.name}</h4>
                          <p className="text-sm text-slate-600">{type.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Fields */}
            <div className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="john@example.com"
                prefix={<Mail className="w-4 h-4" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  prefix={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === 'signup' && (
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm your password"
                  prefix={<Lock className="w-4 h-4" />}
                  required
                />
              )}

              {/* Personal Information (Sign Up) */}
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      value={firstName}
                      onChange={setFirstName}
                      placeholder="John"
                      required
                    />
                    <Input
                      label="Last Name"
                      type="text"
                      value={lastName}
                      onChange={setLastName}
                      placeholder="Smith"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      placeholder="(555) 123-4567"
                      prefix={<Phone className="w-4 h-4" />}
                    />
                    <Input
                      label="ZIP Code"
                      type="text"
                      value={zipCode}
                      onChange={(value) => setZipCode(value.slice(0, 5))}
                      placeholder="12345"
                      prefix={<MapPin className="w-4 h-4" />}
                    />
                  </div>
                </>
              )}

              {/* Business Information */}
              {mode === 'signup' && userType === 'business' && (
                <div className="space-y-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800">Business Information</h3>
                  
                  <Input
                    label="Business Name"
                    type="text"
                    value={businessName}
                    onChange={setBusinessName}
                    placeholder="ABC Kitchen Solutions"
                    required
                  />

                  <Input
                    label="Business Address"
                    type="text"
                    value={businessAddress}
                    onChange={setBusinessAddress}
                    placeholder="123 Main St, City, State 12345"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Business Phone"
                      type="tel"
                      value={businessPhone}
                      onChange={setBusinessPhone}
                      placeholder="(555) 123-4567"
                      prefix={<Phone className="w-4 h-4" />}
                    />
                    <Input
                      label="Years in Business"
                      type="number"
                      value={yearsInBusiness}
                      onChange={setYearsInBusiness}
                      placeholder="5"
                      min="0"
                      max="50"
                    />
                  </div>

                  <Input
                    label="Website (Optional)"
                    type="url"
                    value={businessWebsite}
                    onChange={setBusinessWebsite}
                    placeholder="https://www.yourwebsite.com"
                  />

                  <Input
                    label="License Number (Optional)"
                    type="text"
                    value={licenseNumber}
                    onChange={setLicenseNumber}
                    placeholder="License #12345"
                  />

                  <Input
                    label="Service Areas"
                    type="text"
                    value={serviceAreas}
                    onChange={setServiceAreas}
                    placeholder="12345, 12346, 12347 (comma separated ZIP codes)"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setError(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};