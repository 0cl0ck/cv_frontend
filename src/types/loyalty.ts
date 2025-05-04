// Types pour le programme de fidélité
export type LoyaltyRewardType = 'none' | 'sample' | 'freeShipping' | 'freeProduct' | 'discount';

export interface LoyaltyReward {
  type: LoyaltyRewardType;
  claimed: boolean;
  value?: number;
  description: string;
}

export interface LoyaltyInfo {
  ordersCount: number;
  currentReward: LoyaltyReward;
  referralEnabled: boolean;
}

// Ajout à l'interface utilisateur existante
export interface UserLoyalty {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  loyalty?: LoyaltyInfo;
}
