import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  // Classes de base
  const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Classes selon la variante (sans les couleurs de texte pour permettre le remplacement)
  const variantClasses = {
    primary: 'bg-[#1A3D34] hover:bg-[#132E27] focus:ring-[#1A3D34]',
    outline: 'border border-[#1A3D34] hover:bg-[#F4F8F5]',
    secondary: 'bg-[#F4F8F5] hover:bg-[#E5EDE7]',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };
  
  // Classes par défaut pour le texte si non spécifiées
  const defaultTextClasses = {
    primary: 'text-white',
    outline: 'text-[#1A3D34]',
    secondary: 'text-[#1A3D34]',
    danger: 'text-white',
  };
  
  // Classes selon la taille
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Vérifier si la classe contient déjà une classe de couleur de texte
  const hasTextColorClass = className.includes('text-');
  
  // Construire la classe finale (ajouter la classe de texte par défaut seulement si aucune n'est spécifiée)
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${!hasTextColorClass ? defaultTextClasses[variant] : ''} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};
