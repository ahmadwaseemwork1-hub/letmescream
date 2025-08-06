export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  subscriptionStatus: 'none' | 'basic' | 'premium' | 'unlimited';
  subscriptionId?: string | null;
  screamsThisMonth: number;
  subscriptionEndDate?: Date | null;
  autoRenewal: boolean;
}

export interface Scream {
  id: string;
  userId: string;
  name: string;
  audioUrl: string;
  duration: number;
  maxPitch: number;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: 'basic' | 'premium' | 'unlimited';
  name: string;
  price: number;
  screamsLimit: number | null;
  stripePriceId: string;
  features: string[];
}