import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CI } from '@/app/panier/types';
import { formatPrice } from '@/utils/utils';

interface Props {
  item: CI;
  index: number;
  onQuantityChange: (index: number, qty: number) => void;
  onRemove: (index: number) => void;
}

export default function CartItem({ item, index, onQuantityChange, onRemove }: Props) {
  return (
    <div key={`${item.productId}-${item.variantId}-${index}`} className="md:grid md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 py-6 border-b border-[#3A4A4F]">
      {/* MOBILE */}
      <div className="md:hidden">
        <div className="flex items-center mb-4">
          <div className="w-24 h-24 bg-[#002935] rounded-md overflow-hidden relative">
            {item.image && (
              <Image fill src={item.image} alt={item.name} className="object-cover" />
            )}
          </div>
          <div className="ml-4 flex-grow">
            <h3 className="text-[#F4F8F5] font-medium text-lg">
              <Link href={`/produits/${item.slug}`} className="hover:text-[#D3A74F]">{item.name}</Link>
            </h3>
            {item.weight && <span className="inline-block mt-1 px-2 py-1 bg-[#002935] text-xs text-[#F4F8F5] rounded-full border border-[#3A4A4F]">{item.weight}g</span>}
          </div>
          <button
            onClick={() => onRemove(index)}
            className="p-2 bg-[#481818] text-red-500 hover:bg-red-900 hover:text-white rounded-full transition-colors"
            aria-label="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
        {/* Prix & total */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="bg-[#002935] p-3 rounded-md">
            <span className="block text-xs text-[#8A9A9D] mb-1">Prix unitaire</span>
            <span className="text-[#F4F8F5] font-medium">{formatPrice(item.price)}</span>
          </div>
          <div className="bg-[#002935] p-3 rounded-md">
            <span className="block text-xs text-[#8A9A9D] mb-1">Total</span>
            <span className="text-[#F4F8F5] font-medium">{formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
        {/* Quantité */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center border border-[#3A4A4F] rounded-lg bg-[#002935] p-1">
            <button onClick={() => onQuantityChange(index, item.quantity - 1)} className="w-12 h-12 text-[#F4F8F5] text-xl">-</button>
            <span className="w-16 text-center text-[#F4F8F5] font-medium text-lg">{item.quantity}</span>
            <button onClick={() => onQuantityChange(index, item.quantity + 1)} className="w-12 h-12 text-[#F4F8F5] text-xl">+</button>
          </div>
        </div>
      </div>
      {/* DESKTOP */}
      <div className="hidden md:flex md:items-center">
        <div className="w-20 h-20 bg-[#002935] rounded-md overflow-hidden relative">
          {item.image && <Image fill src={item.image} alt={item.name} className="object-cover" />}
        </div>
        <div className="ml-4">
          <h3 className="text-[#F4F8F5] font-medium">
            <Link href={`/produits/${item.slug}`} className="hover:text-[#D3A74F]">{item.name}</Link>
          </h3>
          {item.weight && <p className="text-sm text-[#F4F8F5]">Poids: {item.weight}g</p>}
        </div>
      </div>
      <div className="hidden md:flex md:flex-col md:justify-center md:items-center">
        <span className="text-xs text-[#8A9A9D] mb-1">Prix unitaire</span>
        <span className="text-[#F4F8F5]">{formatPrice(item.price)}</span>
      </div>
      <div className="hidden md:flex md:justify-center md:items-center">
        <div className="flex items-center border border-[#3A4A4F] rounded-md">
          <button onClick={() => onQuantityChange(index, item.quantity - 1)} className="w-8 h-8 text-[#F4F8F5]">-</button>
          <span className="w-10 text-center text-[#F4F8F5]">{item.quantity}</span>
          <button onClick={() => onQuantityChange(index, item.quantity + 1)} className="w-8 h-8 text-[#F4F8F5]">+</button>
        </div>
      </div>
      <div className="hidden md:flex md:flex-col md:justify-center md:items-center">
        <span className="text-xs text-[#8A9A9D] mb-1">Total</span>
        <span className="text-[#F4F8F5] font-medium">{formatPrice(item.price * item.quantity)}</span>
      </div>
      <div className="hidden md:flex md:justify-center md:items-center">
        <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  );
}
