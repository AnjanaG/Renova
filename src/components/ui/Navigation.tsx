import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, User, LogOut, Shield } from 'lucide-react';
import { Button } from './Button';

interface NavigationProps {
  showBack?: boolean;
  onHome?: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  stepName?: string;
  user?: any;
  onAuthClick?: () => void;
  onSignOut?: () => void;
  onAdminClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  showBack = false,
  onHome,
  onBack,
  currentStep,
  totalSteps,
  stepName,
  user,
  onAuthClick,
  onSignOut,
  onAdminClick
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Back button */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Renova
                </h1>
                <p className="text-sm text-slate-600">Kitchen Remodeling Made Simple</p>
              </div>
            </div>
            
            {showBack && onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            )}
          </div>

          {/* Center - Step info (if in workflow) */}
          {currentStep !== undefined && totalSteps && stepName && (
            <div className="hidden md:block text-center">
              <p className="text-sm font-medium text-slate-800">
                Step {currentStep + 1} of {totalSteps}
              </p>
              <p className="text-xs text-slate-600">{stepName}</p>
            </div>
          )}

          {/* Right side - Home and Profile buttons */}
          <div className="flex items-center space-x-3">
            {/* Home Button - Always visible */}
            {onHome && (
              <Button
                onClick={onHome}
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Home</span>
              </Button>
            )}
            
            {/* Admin Access Button */}
            <Button
              onClick={onAdminClick}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Admin</span>
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.profile?.first_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-slate-800">
                      {user.profile?.first_name} {user.profile?.last_name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {user.profile?.user_type === 'business' 
                        ? user.profile?.business_name || 'Business Account'
                        : 'Homeowner'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onAuthClick}
                variant="outline"
                size="sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};