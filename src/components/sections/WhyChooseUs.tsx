'use client';

import React from 'react';
import { ShieldCheck, Truck, Leaf, Award } from 'lucide-react';

// Type pour nos avantages
type Benefit = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

// Liste des avantages
const benefits: Benefit[] = [
  {
    id: '1',
    title: 'Produits 100% naturels',
    description: 'Tous nos produits sont issus d\'agriculture biologique, sans pesticides ni additifs.',
    icon: <Leaf className="h-8 w-8 text-green-600" />
  },
  {
    id: '2',
    title: 'Qualité garantie',
    description: 'Nos produits sont régulièrement testés en laboratoire pour garantir leur qualité et sécurité.',
    icon: <Award className="h-8 w-8 text-green-600" />
  },
  {
    id: '3',
    title: 'Livraison rapide',
    description: 'Expédition sous 24-48h pour toutes vos commandes en France métropolitaine.',
    icon: <Truck className="h-8 w-8 text-green-600" />
  },
  {
    id: '4',
    title: 'Paiement sécurisé',
    description: 'Vos transactions sont 100% sécurisées avec un système de paiement fiable.',
    icon: <ShieldCheck className="h-8 w-8 text-green-600" />
  }
];

export default function WhyChooseUs() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">Pourquoi nous choisir ?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((benefit) => (
          <div key={benefit.id} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-4">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
            <p className="text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
