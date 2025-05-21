import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';


export default function GuestLoyaltyBanner() {
  return (
    <div className="mt-3 bg-[#002935] border border-[#3A4A4F] rounded-md p-3">
      <div className="flex items-center text-[#F4F8F5] mb-1">
        <AlertCircle size={16} className="mr-2 text-[#EFC368]" />
        <span className="font-medium">Programme de fidélité</span>
      </div>
      <p className="text-xs text-[#F4F8F5] mb-2">
        Connectez-vous pour bénéficier d’avantages exclusifs selon votre historique de commandes.
      </p>
      <Link href="/connexion?redirect=/panier" className="text-[#EFC368] text-xs hover:underline">
        Se connecter pour en profiter
      </Link>
    </div>
  );
}
