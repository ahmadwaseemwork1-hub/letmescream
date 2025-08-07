export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  mode: 'payment' | 'subscription';
  features: string[];
  popular?: boolean;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_basic',
    priceId: 'price_basic_2',
    name: 'Basic',
    description: 'Perfect for occasional screamers',
    price: 2.00,
    mode: 'subscription',
    features: [
      'Save up to 10 screams',
      'Basic analytics',
      'Download your screams',
      'Cancel anytime'
    ]
  },
  {
    id: 'prod_premium',
    priceId: 'price_premium_5',
    name: 'Premium',
    description: 'For regular stress relief',
    price: 5.00,
    mode: 'subscription',
    features: [
      'Save up to 50 screams',
      'Advanced analytics',
      'Download your screams',
      'Priority support',
      'Cancel anytime'
    ],
    popular: true
  },
  {
    id: 'prod_unlimited',
    priceId: 'price_unlimited_10',
    name: 'Unlimited',
    description: 'For the ultimate screamer',
    price: 10.00,
    mode: 'subscription',
    features: [
      'Unlimited screams',
      'Advanced analytics',
      'Download your screams',
      'Priority support',
      'Early access to features',
      'Cancel anytime'
    ]
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};