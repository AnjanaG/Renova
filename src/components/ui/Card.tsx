import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  variant = 'default'
}) => {
  const baseClasses = 'rounded-3xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white shadow-lg shadow-slate-200/50 border border-slate-100',
    elevated: 'bg-white shadow-xl shadow-slate-200/60 border border-slate-50',
    bordered: 'bg-white border-2 border-slate-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/30'
  };
  
  const hoverClasses = hover ? 'hover:shadow-2xl hover:shadow-slate-200/60 hover:border-indigo-200 hover:-translate-y-1 cursor-pointer' : '';

  const cardComponent = (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {cardComponent}
      </motion.div>
    );
  }

  return cardComponent;
};