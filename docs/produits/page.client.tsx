'use client';
import { useHeaderTheme } from '@/providers/HeaderTheme';
import React, { useEffect } from 'react';

const ProductsPageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme();

  useEffect(() => {
    setHeaderTheme('light');
  }, [setHeaderTheme]);
  
  return <React.Fragment />;
};

export default ProductsPageClient;
