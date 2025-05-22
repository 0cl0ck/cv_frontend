import React from 'react';
import { Gift, Truck, AlertCircle } from 'lucide-react';
import { LoyaltyBenefits } from '../types';

interface Props {
  loyaltyBenefits: LoyaltyBenefits;
  loading: boolean;
  isAuthenticated: boolean;
}

export default function LoyaltyBenefitsPanel({ loyaltyBenefits, loading, isAuthenticated }: Props) {
  if (loading) {
    return <div className="text-sm text-[#F4F8F5] italic">Vérification du programme fidélité...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-3 bg-[#002935] border border-[#3A4A4F] rounded-md p-3">
        <div className="flex items-center text-[#F4F8F5] mb-1">
          <AlertCircle size={16} className="mr-2 text-[#EFC368]" />
          <span className="font-medium">Programme de fidélité</span>
        </div>
        <p className="text-xs text-[#F4F8F5] mb-2">
          Connectez-vous pour bénéficier d’avantages exclusifs selon votre historique de commandes.
        </p>
        <a href="/connexion?redirect=/panier" className="text-[#EFC368] text-xs hover:underline">
          Se connecter pour en profiter
        </a>
      </div>
    );
  }

  // Utilisateur authentifié
  const { orderCount, active, rewardType, nextLevel } = loyaltyBenefits;
  const icon = rewardType === 'freeShipping' ? <Truck size={18} className="mr-2" /> : <Gift size={18} className="mr-2" />;

  return (
    <div className="mt-3 bg-[#001f29] border border-[#3A4A4F] rounded-md p-3">
      {/* Récompense immédiate s’il y en a */}
      {active && (
        <div className="flex items-center text-[#10B981] font-medium mb-2">
          {icon} Avantage fidélité appliqué !
        </div>
      )}

      {/* Progression + barre */}
      <p className="text-xs text-[#F4F8F5] mb-1">
        <span className="text-[#EFC368]">Votre statut :</span>{' '}
        {orderCount < 3 ? 'Nouveau client'
          : orderCount < 5 ? 'Bronze'
          : orderCount < 10 ? 'Argent'
          : 'Or'
        }
        <span className="ml-1 text-[#8A9EA5]">({orderCount} commande{orderCount>1?'s':''})</span>
      </p>
      <div className="w-full bg-[#002935] h-1.5 rounded-full overflow-hidden my-2">
        <div
          className={`h-full rounded-full ${
            orderCount>=10?'bg-[#FFD700]': /* Or */
            orderCount>=5?'bg-[#C0C0C0]': /* Argent */
            orderCount>=3?'bg-[#CD7F32]':'bg-[#EFC368]' /* Bronze ou Nouveau client */
          }`}
          style={{ width: `${Math.min(orderCount*10,100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-[#8A9EA5] px-1">
        <span>1</span><span>5</span><span>10</span>
      </div>

      {/* Liste des paliers */}
      <div className="mt-3 text-[10px] text-[#F4F8F5]">
        <p className="text-xs text-[#EFC368] font-medium mb-1">Récompenses ponctuelles :</p>
        <ul className="ml-4 list-disc">
          <li className={orderCount>=2?'text-green-400':''}>2 commandes : Échantillon offert</li>
          <li className={orderCount>=3?'text-green-400':''}>3 commandes : Livraison offerte (5 €)</li>
          <li className={orderCount>=5?'text-green-400':''}>5 commandes : Produit offert (10 €)</li>
          <li className={orderCount>=10?'text-green-400':''}>10 commandes : Réduction 20 € ou produit offert</li>
        </ul>

        <p className="text-xs text-[#EFC368] font-medium mt-2 mb-1">Niveaux de fidélité :</p>
        <ul className="ml-4 list-disc text-[10px]">
          <li className={orderCount>=3?'text-green-400':''}><strong className="text-[#CD7F32]">Bronze</strong> (3 commandes) : 5 % permanent</li>
          <li className={orderCount>=5?'text-green-400':''}><strong className="text-[#C0C0C0]">Argent</strong> (5 commandes) : 10 % permanent</li>
          <li className={orderCount>=10?'text-green-400':''}><strong className="text-[#FFD700]">Or</strong> (10 commandes) : Accès en avant-première aux promotions et événements</li>
        </ul>
      </div>

      {/* Prochain palier */}
      {nextLevel && (
        <p className="text-[11px] text-green-400 mt-2">
          Plus que {nextLevel.remainingOrders} commande{nextLevel.remainingOrders>1?'s':''} pour débloquer “{nextLevel.name}” !
        </p>
      )}
    </div>
  );
}
