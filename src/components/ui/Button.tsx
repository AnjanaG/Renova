import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  loading = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 focus:ring-indigo-500/50',
    secondary: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500/50',
    outline: 'border-2 border-slate-300 text-slate-700 bg-white hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500/30 shadow-sm hover:shadow-md',
    ghost: 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500/30',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-600 hover:to-rose-700 focus:ring-red-500/50'
  };

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs gap-1.5',
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
    xl: 'px-10 py-5 text-xl gap-3'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      onClick={disabled || loading ? undefined : onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      )}
      {children}
    </motion.button>
  );
};