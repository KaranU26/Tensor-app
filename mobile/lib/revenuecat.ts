import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';

// ─── Configuration ──────────────────────────────────────────────
const REVENUECAT_API_KEY = 'test_bxQwvKvFbNbGaJbNHKTTmIxveVz';
export const ENTITLEMENT_ID = 'TensorFit Pro';

// Product identifiers configured in RevenueCat dashboard
export const PRODUCT_IDS = {
  monthly: 'monthly',
  yearly: 'yearly',
  lifetime: 'lifetime',
} as const;

export type PlanId = keyof typeof PRODUCT_IDS;

// ─── Initialization ─────────────────────────────────────────────
let isConfigured = false;

export async function configureRevenueCat(): Promise<void> {
  if (isConfigured) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  }

  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  isConfigured = true;
}

// ─── User Identification ────────────────────────────────────────
export async function loginRevenueCat(appUserId: string): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.logIn(appUserId);
  return customerInfo;
}

export async function logoutRevenueCat(): Promise<CustomerInfo> {
  return Purchases.logOut();
}

// ─── Entitlement Checking ───────────────────────────────────────
export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function customerHasProEntitlement(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

export function getActiveSubscriptionPlan(customerInfo: CustomerInfo): {
  isPro: boolean;
  planType: string;
  expiresAt: string | null;
} {
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) {
    return { isPro: false, planType: 'free', expiresAt: null };
  }

  // Determine plan type from product identifier
  const productId = entitlement.productIdentifier;
  let planType = 'pro';
  if (productId.includes('monthly') || productId === PRODUCT_IDS.monthly) {
    planType = 'monthly';
  } else if (productId.includes('yearly') || productId === PRODUCT_IDS.yearly) {
    planType = 'yearly';
  } else if (productId.includes('lifetime') || productId === PRODUCT_IDS.lifetime) {
    planType = 'lifetime';
  }

  return {
    isPro: true,
    planType,
    expiresAt: entitlement.expirationDate,
  };
}

// ─── Offerings & Packages ───────────────────────────────────────
export async function getOfferings(): Promise<PurchasesOfferings> {
  return Purchases.getOfferings();
}

export async function getCurrentPackages(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export function findPackageByProductId(
  packages: PurchasesPackage[],
  productId: string
): PurchasesPackage | undefined {
  return packages.find((pkg) => pkg.product.identifier === productId);
}

// ─── Purchases ──────────────────────────────────────────────────
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ customerInfo: CustomerInfo; isPro: boolean }> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const isPro = customerHasProEntitlement(customerInfo);
  return { customerInfo, isPro };
}

// ─── Restore ────────────────────────────────────────────────────
export async function restorePurchases(): Promise<{
  customerInfo: CustomerInfo;
  isPro: boolean;
}> {
  const customerInfo = await Purchases.restorePurchases();
  const isPro = customerHasProEntitlement(customerInfo);
  return { customerInfo, isPro };
}

// ─── Listener ───────────────────────────────────────────────────
export function addCustomerInfoUpdateListener(
  listener: (customerInfo: CustomerInfo) => void
): () => void {
  const remove = Purchases.addCustomerInfoUpdateListener(listener);
  return remove;
}

// ─── Error Helpers ──────────────────────────────────────────────
export function isPurchaseCancelledError(error: any): boolean {
  return error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}

export function getPurchaseErrorMessage(error: any): string {
  if (isPurchaseCancelledError(error)) {
    return 'Purchase was cancelled.';
  }
  if (error?.code === PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR) {
    return 'This product is not available for purchase.';
  }
  if (error?.code === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
    return 'Network error. Please check your connection and try again.';
  }
  if (error?.code === PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR) {
    return 'There was a problem with the app store. Please try again later.';
  }
  return error?.message || 'Something went wrong. Please try again.';
}
