import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import {
  getCustomerInfo,
  getActiveSubscriptionPlan,
  restorePurchases as rcRestorePurchases,
  addCustomerInfoUpdateListener,
  ENTITLEMENT_ID,
} from '@/lib/revenuecat';

interface SubscriptionState {
  isPro: boolean;
  planType: string;
  expiresAt: string | null;
  isLoading: boolean;

  checkEntitlements: () => Promise<void>;
  setPro: (planType: string, expiresAt?: string | null) => void;
  restorePurchases: () => Promise<boolean>;
  syncSubscriptionToBackend: (data: {
    planType: string;
    status: string;
    provider: string;
    providerSubscriptionId?: string;
    providerCustomerId?: string;
    pricePaid?: number;
    expiresAt?: string;
  }) => Promise<void>;
  setupCustomerInfoListener: () => () => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      planType: 'free',
      expiresAt: null,
      isLoading: false,

      checkEntitlements: async () => {
        set({ isLoading: true });
        try {
          const customerInfo = await getCustomerInfo();
          const subscription = getActiveSubscriptionPlan(customerInfo);
          set({
            isPro: subscription.isPro,
            planType: subscription.planType,
            expiresAt: subscription.expiresAt,
          });

          // Also sync to backend for server-side checks
          if (subscription.isPro) {
            get().syncSubscriptionToBackend({
              planType: subscription.planType,
              status: 'active',
              provider: 'revenuecat',
              expiresAt: subscription.expiresAt ?? undefined,
            });
          }
        } catch (e) {
          console.log('Failed to check entitlements via RevenueCat:', e);
          // Fallback: check backend
          try {
            const response = await fetchWithAuth('/user/subscription');
            if (response.ok) {
              const data = await response.json();
              const sub = data.subscription;
              if (sub && sub.status === 'active' && sub.planType !== 'free') {
                set({
                  isPro: true,
                  planType: sub.planType,
                  expiresAt: sub.expiresAt || null,
                });
              } else {
                set({ isPro: false, planType: 'free', expiresAt: null });
              }
            }
          } catch {
            // Keep cached state
          }
        } finally {
          set({ isLoading: false });
        }
      },

      setPro: (planType: string, expiresAt?: string | null) => {
        set({
          isPro: true,
          planType,
          expiresAt: expiresAt || null,
        });
      },

      restorePurchases: async () => {
        set({ isLoading: true });
        try {
          const { customerInfo, isPro } = await rcRestorePurchases();
          const subscription = getActiveSubscriptionPlan(customerInfo);
          set({
            isPro: subscription.isPro,
            planType: subscription.planType,
            expiresAt: subscription.expiresAt,
          });

          if (subscription.isPro) {
            get().syncSubscriptionToBackend({
              planType: subscription.planType,
              status: 'active',
              provider: 'revenuecat',
              expiresAt: subscription.expiresAt ?? undefined,
            });
          }

          return isPro;
        } catch (e) {
          console.log('Failed to restore purchases:', e);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      syncSubscriptionToBackend: async (data) => {
        try {
          const response = await fetchWithAuth('/user/subscription', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          if (!response.ok) {
            console.log('Failed to sync subscription to backend');
          }
        } catch (e) {
          console.log('Subscription sync error:', e);
        }
      },

      setupCustomerInfoListener: () => {
        const remove = addCustomerInfoUpdateListener((customerInfo) => {
          const subscription = getActiveSubscriptionPlan(customerInfo);
          set({
            isPro: subscription.isPro,
            planType: subscription.planType,
            expiresAt: subscription.expiresAt,
          });
        });
        return remove;
      },

      reset: () => {
        set({ isPro: false, planType: 'free', expiresAt: null });
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPro: state.isPro,
        planType: state.planType,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
