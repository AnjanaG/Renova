import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  suffix?: string;
  prefix?: string | React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  suffix,
  prefix,
  min,
  max,
  step,
  error,
  disabled = false,
  required = false
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
            {typeof prefix === 'string' ? (
              <span className="text-base">{prefix}</span>
            ) : (
              prefix
            )}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3.5 ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-12' : ''} 
            border-2 border-slate-200 rounded-2xl 
            focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:outline-none 
            transition-all duration-300 text-base
            hover:border-slate-300
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-base font-medium">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};