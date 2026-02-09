import React, { useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { router } from 'expo-router';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

import { colors } from '@/config/theme';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { playHaptic } from '@/lib/sounds';
import { ENTITLEMENT_ID } from '@/lib/revenuecat';

export default function PaywallScreen() {
  const { checkEntitlements } = useSubscriptionStore();

  const handlePurchaseCompleted = useCallback(async () => {
    playHaptic('success');
    await checkEntitlements();
    Alert.alert(
      'Welcome to TensorFit Pro!',
      'You now have access to all premium features.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [checkEntitlements]);

  const handleRestoreCompleted = useCallback(async () => {
    playHaptic('success');
    await checkEntitlements();
    Alert.alert(
      'Restored!',
      'Your TensorFit Pro subscription has been restored.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [checkEntitlements]);

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        options={{
          requiredEntitlementIdentifier: ENTITLEMENT_ID,
        }}
        onPurchaseCompleted={handlePurchaseCompleted}
        onRestoreCompleted={handleRestoreCompleted}
        onDismiss={() => router.back()}
        onPurchaseError={(error) => {
          playHaptic('error');
          console.log('Purchase error:', error);
        }}
        onPurchaseCancelled={() => {
          playHaptic('selection');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
