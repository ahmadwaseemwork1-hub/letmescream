import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, X, CreditCard, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { stripeProducts } from '../stripe-config';

interface SubscriptionPaywallProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export default function SubscriptionPaywall({ onClose, onSubscribe }: SubscriptionPaywallProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>(stripeProducts[1].id); // Default to Premium
  const { user } = useAuth();
  const { createCheckoutSession } = useStripeCheckout();

  const handleSubscribe = async (priceId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/?subscription=success`;
      const cancelUrl = `${window.location.origin}/?subscription=cancelled`;

      await createCheckoutSession({
        priceId,
        mode: 'subscription',
        successUrl,
        cancelUrl
      });

      onSubscribe();
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-off-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* Header with Home and Close buttons */}
        <div className="flex items-center justify-between p-4 border-b border-soft-lavender">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-2 bg-soft-lavender hover:bg-soft-lavender/80 text-light-gray rounded-lg transition-colors"
          >
            <Home size={16} />
            <span className="text-sm">Home</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-soft-lavender rounded-full transition-colors"
          >
            <X size={20} className="text-light-gray" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-purple to-accent-pink rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown size={24} className="text-off-white" />
            </div>
            <h2 className="text-3xl font-bold text-light-gray mb-2">
              Choose Your Plan
            </h2>
            <p className="text-light-gray/70">
              Subscribe to save and manage your screams
            </p>
          </div>

          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {stripeProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`relative rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                  selectedPlan === product.id
                    ? 'border-primary-purple bg-primary-purple/5'
                    : 'border-soft-lavender hover:border-primary-purple/50'
                } ${product.popular ? 'ring-2 ring-accent-pink ring-opacity-50' : ''}`}
                onClick={() => setSelectedPlan(product.id)}
              >
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent-pink text-off-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-light-gray mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-primary-purple">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-light-gray/70 ml-1">/month</span>
                  </div>
                  <p className="text-light-gray/70 text-sm">
                    {product.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check size={16} className="text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-light-gray">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(product.priceId)}
                  disabled={loading || !user}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    selectedPlan === product.id
                      ? 'bg-gradient-to-r from-primary-purple to-accent-pink hover:from-primary-purple/80 hover:to-accent-pink/80 text-off-white'
                      : 'bg-soft-lavender hover:bg-soft-lavender/80 text-light-gray'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>Subscribe Now</span>
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {!user && (
            <p className="text-center text-sm text-light-gray/60 mt-4">
              Please sign in to subscribe
            </p>
          )}

          <div className="text-center mt-4 text-xs text-light-gray/60">
            <p>Secure payments powered by Stripe</p>
            <p className="mt-1">Cancel your subscription anytime</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}