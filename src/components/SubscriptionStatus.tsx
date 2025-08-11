import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';

export default function SubscriptionStatus() {
  const { subscription, loading, hasActiveSubscription } = useSubscription();

  if (loading) {
    return (
      <div className="bg-pale-lilac/50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-soft-lavender rounded w-1/2"></div>
      </div>
    );
  }

  if (!subscription || !hasActiveSubscription) {
    return (
      <div className="bg-accent-pink/10 border border-accent-pink/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-accent-pink">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">No active subscription</span>
        </div>
      </div>
    );
  }

  const product = subscription.priceId ? getProductByPriceId(subscription.priceId) : null;
  const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd * 1000) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-purple/10 border border-primary-purple/20 rounded-lg p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-purple to-accent-pink rounded-full flex items-center justify-center">
            <Crown size={16} className="text-off-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-light-gray">
                {product?.name || 'Active Subscription'}
              </span>
              <CheckCircle size={14} className="text-primary-purple" />
            </div>
            <p className="text-xs text-light-gray/70 capitalize">
              Status: {subscription.status}
            </p>
          </div>
        </div>

        {product && (
          <div className="text-right">
            <p className="text-sm font-medium text-light-gray">
              ${product.price.toFixed(2)}/month
            </p>
          </div>
        )}
      </div>

      {periodEnd && (
        <div className="mt-3 pt-3 border-t border-primary-purple/20">
          <div className="flex items-center justify-between text-xs text-light-gray/70">
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>
                {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on {periodEnd.toLocaleDateString()}
              </span>
            </div>
            
            {subscription.paymentMethodLast4 && (
              <div className="flex items-center space-x-1">
                <CreditCard size={12} />
                <span>
                  {subscription.paymentMethodBrand} ••••{subscription.paymentMethodLast4}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {subscription.cancelAtPeriodEnd && (
        <div className="mt-2 text-xs text-accent-pink">
          Your subscription will not renew automatically
        </div>
      )}
    </motion.div>
  );
}