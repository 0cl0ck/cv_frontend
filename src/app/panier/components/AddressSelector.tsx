import React from 'react';
import { Address } from '../types';
import { MapPin, CheckCircle } from 'lucide-react';

interface Props {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (addr: Address) => void;
  loading: boolean;
}

export default function AddressSelector({ addresses, selectedId, onSelect, loading }: Props) {
  if (loading) return <div className="text-sm text-[#F4F8F5] italic">Chargement des adresses…</div>;
  if (!addresses.length) return null;

  return (
    <div className="mb-6 border-b border-[#3A4A4F] pb-6">
      <h3 className="text-base font-bold mb-3 text-[#F4F8F5]">Vos adresses de livraison</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {addresses.map(addr => (
          <div
            key={addr.id}
            className={`border rounded-lg p-3 cursor-pointer ${selectedId === addr.id ? 'border-[#03745C] bg-[#03745C] bg-opacity-5' : 'border-[#3A4A4F] hover:border-[#03745C]'}`}
            onClick={() => onSelect(addr)}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center">
                <MapPin size={14} className="mr-1 text-[#001E27]" />
                <span className="text-sm font-medium">Adresse de livraison</span>
              </div>
              {addr.isDefault && (
                <div className="bg-[#007A72] text-white text-xs rounded px-1.5 py-0.5 flex items-center">
                  <CheckCircle size={10} className="mr-1" /> Par défaut
                </div>
              )}
            </div>
            <p className="font-medium text-sm">{addr.name}</p>
            <p className="text-xs text-[#F4F8F5]">{addr.line1}</p>
            {addr.line2 && <p className="text-xs text-[#F4F8F5]">{addr.line2}</p>}
            <p className="text-xs text-[#F4F8F5]">{addr.postalCode} {addr.city}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500">Sélectionnez une adresse ou remplissez le formulaire ci-dessous</p>
    </div>
  );
}
