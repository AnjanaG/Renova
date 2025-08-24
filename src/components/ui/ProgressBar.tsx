import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  index < currentStep
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : index === currentStep
                    ? 'bg-indigo-500 text-white shadow-indigo-200'
                    : 'bg-slate-200 text-slate-500'
                }`}
                animate={{ scale: index === currentStep ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {index + 1}
              </motion.div>
              {index < totalSteps - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-1 bg-slate-200 rounded-full">
                    <motion.div
                      className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: index < currentStep ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>
            <span className={`text-sm mt-2 font-medium ${
              index <= currentStep ? 'text-slate-700' : 'text-slate-400'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};