import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  // Réduire les styles de base pour permettre la personnalisation complète
  const baseClasses = 'w-full px-3 py-2 rounded-md';
  const textareaClasses = `${baseClasses} ${className}`;
  
  return <textarea className={textareaClasses} {...props} />;
};
