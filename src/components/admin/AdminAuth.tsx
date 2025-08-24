import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminAuthProps {
  onAuthSuccess: (adminUser: any) => void;
  onClose: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');

  const handleInitialAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', data.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Move to verification step
      setStep('verification');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify admin code (in production, this would be more sophisticated)
      const expectedCode = `ADMIN-${new Date().getFullYear()}-${email.split('@')[0].toUpperCase()}`;
      
      if (adminCode !== expectedCode && adminCode !== 'RENOVA-ADMIN-2025') {
        throw new Error('Invalid admin verification code');
      }

      // Create admin session
      const { data: sessionData, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
          session_token: generateSessionToken(),
          expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Get full admin user data
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (adminError) throw adminError;

      // Log admin login
      await supabase.rpc('log_admin_action', {
        action_name: 'admin_login',
        resource_type: 'auth',
        new_values: { session_id: sessionData.id }
      });

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      onAuthSuccess({
        ...adminUser,
        session: sessionData
      });
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionToken = () => {
    return 'admin_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  };

  const getExpectedCode = () => {
    if (email) {
      return `ADMIN-${new Date().getFullYear()}-${email.split('@')[0].toUpperCase()}`;
    }
    return 'ADMIN-YYYY-USERNAME';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl max-w-md w-full"
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {step === 'credentials' ? 'Admin Access' : 'Verification Required'}
            </h2>
            <p className="text-slate-600 mt-2">
              {step === 'credentials' 
                ? 'Authorized personnel only' 
                : 'Enter your admin verification code'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={(e) => { e.preventDefault(); handleInitialAuth(); }}>
              <div className="space-y-6">
                <Input
                  label="Admin Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="admin@renova.com"
                  required
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter admin password"
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

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading || !email || !password}
                >
                  Continue to Verification
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleAdminVerification(); }}>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Authentication Successful</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Admin account verified. Please enter your verification code.
                  </p>
                </div>

                <Input
                  label="Admin Verification Code"
                  type="text"
                  value={adminCode}
                  onChange={setAdminCode}
                  placeholder={getExpectedCode()}
                  required
                />

                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Expected format:</p>
                  <code className="text-slate-700">{getExpectedCode()}</code>
                  <p className="mt-2">Or use master code: <code className="text-slate-700">RENOVA-ADMIN-2025</code></p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setStep('credentials')}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    loading={isLoading}
                    disabled={isLoading || !adminCode}
                    className="flex-1"
                  >
                    Verify Access
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-xs">
              <Shield className="w-3 h-3 inline mr-1" />
              This is a secure admin area. All actions are logged and monitored.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};