import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Subscription {
  customerId: string;
  subscriptionId: string | null;
  status: string;
  priceId: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    loadSubscription();

    // Subscribe to real-time changes
    const subscription_channel = supabase
      .channel('subscription_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'stripe_subscriptions'
        }, 
        () => {
          loadSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription_channel.unsubscribe();
    };
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setSubscription({
          customerId: data.customer_id,
          subscriptionId: data.subscription_id,
          status: data.subscription_status,
          priceId: data.price_id,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          paymentMethodBrand: data.payment_method_brand,
          paymentMethodLast4: data.payment_method_last4,
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const isActive = subscription?.status === 'active';
  const isTrialing = subscription?.status === 'trialing';
  
  // Check for temporary bypass (for testing)
  const tempBypass = localStorage.getItem('temp_bypass_subscription') === 'true';
  
  const hasActiveSubscription = isActive || isTrialing || tempBypass;

  return {
    subscription,
    loading,
    error,
    isActive,
    isTrialing,
    hasActiveSubscription,
    refetch: loadSubscription,
  };
}