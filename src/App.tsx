import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomePage } from './components/HomePage';
import { Navigation } from './components/ui/Navigation';
import { AuthModal } from './components/auth/AuthModal';
import { AdminAuth } from './components/admin/AdminAuth';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProgressBar } from './components/ui/ProgressBar';
import { PlannerStep } from './components/steps/PlannerStep';
import { DesignerStep } from './components/steps/DesignerStep';
import { QuoterStep } from './components/steps/QuoterStep';
import { ContractorStep } from './components/steps/ContractorStep';
import { ReviewStep } from './components/steps/ReviewStep';
import { supabase } from './lib/supabase';

const STEPS = [
  'Plan Your Kitchen',
  'Design Cabinets', 
  'Get Your Quote',
  'Find Contractors',
  'Review & Save'
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPlanner, setShowPlanner] = useState(false);
  const [projectData, setProjectData] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const handleStartPlanning = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowPlanner(true);
  };

  const handleGoHome = () => {
    setShowPlanner(false);
    setCurrentStep(0);
    setProjectData({});
  };

  const handleNext = (stepData: any) => {
    setProjectData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSaveProject = async (userData: any) => {
    // In a real app, this would save to Supabase
    console.log('Saving project:', { ...projectData, user: userData });
    
    // For demo purposes, just show success
    alert('Project saved successfully!');
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowPlanner(false);
    setCurrentStep(0);
    setProjectData({});
  };

  const handleAdminAuthSuccess = (admin: any) => {
    setAdminUser(admin);
    setShowAdminAuth(false);
    setShowAdminDashboard(true);
  };

  const handleAdminSignOut = () => {
    setAdminUser(null);
    setShowAdminDashboard(false);
  };

  // Show admin dashboard if admin is logged in
  if (showAdminDashboard && adminUser) {
    return <AdminDashboard adminUser={adminUser} onSignOut={handleAdminSignOut} onGoHome={handleGoHome} />;
  }

  // Show home page if planner hasn't started
  if (!showPlanner) {
    return (
      <>
        <Navigation 
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          onAdminClick={() => setShowAdminAuth(true)}
        />
        <HomePage onStartPlanning={handleStartPlanning} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
        {showAdminAuth && (
          <AdminAuth
            onAuthSuccess={handleAdminAuthSuccess}
            onClose={() => setShowAdminAuth(false)}
          />
        )}
        {showAdminAuth && (
          <AdminAuth
            onAuthSuccess={handleAdminAuthSuccess}
            onClose={() => setShowAdminAuth(false)}
          />
        )}
      </>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PlannerStep 
            onNext={handleNext} 
            initialData={projectData}
          />
        );
      case 1:
        return (
          <DesignerStep 
            onNext={handleNext}
            onBack={handleBack}
            projectData={projectData}
            initialData={projectData}
          />
        );
      case 2:
        return (
          <QuoterStep
            onNext={handleNext}
            onBack={handleBack}
            projectData={projectData}
          />
        );
      case 3:
        return (
          <ContractorStep
            onNext={handleNext}
            onBack={handleBack}
            projectData={projectData}
          />
        );
      case 4:
        return (
          <ReviewStep
            onBack={handleBack}
            onSave={handleSaveProject}
            projectData={projectData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navigation */}
      <Navigation
        showBack={currentStep > 0}
        onHome={handleGoHome}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepName={STEPS[currentStep]}
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <p className="text-slate-600">
              Making kitchen remodeling simple, transparent, and stress-free
            </p>
            <div className="flex justify-center space-x-6 text-sm text-slate-500">
              <span>© 2025 Renova</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;