import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#1A3D34] focus:border-[#1A3D34]';
  const inputClasses = `${baseClasses} ${className}`;
  
  return <input className={inputClasses} {...props} />;
};
