import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { 
  Home, 
  Ruler, 
  Palette, 
  Calculator, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

interface HomePageProps {
  onStartPlanning: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartPlanning }) => {
  const workflowSteps = [
    {
      icon: Ruler,
      title: 'Plan',
      description: 'Enter room dimensions'
    },
    {
      icon: Palette,
      title: 'Design',
      description: 'Choose your style'
    },
    {
      icon: Calculator,
      title: 'Quote',
      description: 'Get transparent pricing'
    },
    {
      icon: Users,
      title: 'Connect',
      description: 'Find contractors'
    },
    {
      icon: CheckCircle,
      title: 'Complete',
      description: 'Save your plan'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-16"
          >
            <div className="space-y-10">
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
                Plan. Design. Build.
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto font-light leading-relaxed">
                The complete kitchen remodeling platform that connects homeowners with trusted contractors
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button onClick={onStartPlanning} size="xl" className="text-xl px-12">
                Start Planning Your Kitchen
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-32 left-20 opacity-20">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl"
          />
        </div>
        <div className="absolute top-48 right-32 opacity-20">
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
          />
        </div>
      </div>

      {/* Simple Workflow Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-8 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Five simple steps to transform your kitchen
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card hover variant="elevated" className="p-6 text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm">{step.description}</p>
                </Card>
                
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Benefits Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Why Choose Renova?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="elevated" className="p-8 text-center">
                <Zap className="w-14 h-14 text-indigo-500 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-4">All-in-One</h3>
                <p className="text-slate-600 text-base">No more jumping between different tools</p>
              </Card>
              
              <Card variant="elevated" className="p-8 text-center">
                <Calculator className="w-14 h-14 text-purple-500 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-4">Transparent Pricing</h3>
                <p className="text-slate-600 text-base">Know your budget upfront</p>
              </Card>
              
              <Card variant="elevated" className="p-8 text-center">
                <Star className="w-14 h-14 text-emerald-500 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-4">Trusted Contractors</h3>
                <p className="text-slate-600 text-base">Pre-screened professionals</p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Simple CTA Section */}
      <div className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              Ready to Start?
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto font-light">
              Join thousands of homeowners who've simplified their kitchen remodeling with Renova
            </p>
            <Button 
              onClick={onStartPlanning}
              size="xl" 
              variant="secondary"
              className="bg-white text-indigo-600 hover:bg-slate-50 shadow-2xl"
            >
              Start Your Free Kitchen Plan
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};