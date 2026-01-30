/**
 * useOfflineSync Hook
 * Provides sync status and offline capabilities to components
 */

import { useState, useEffect, useCallback } from 'react';
import { subscribeSyncState, forceSync, isOnline } from '@/lib/syncEngine';

interface SyncStatus {
  status: 'idle' | 'syncing' | 'error' | 'offline';
  pendingCount: number;
  lastSyncAt: Date | null;
  lastError: string | null;
  isOnline: boolean;
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    pendingCount: 0,
    lastSyncAt: null,
    lastError: null,
    isOnline: true,
  });

  useEffect(() => {
    const unsubscribe = subscribeSyncState((state) => {
      setSyncStatus({
        ...state,
        isOnline: isOnline(),
      });
    });

    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    try {
      await forceSync();
    } catch (error: any) {
      console.error('Manual sync failed:', error.message);
    }
  }, []);

  return {
    ...syncStatus,
    triggerSync,
    hasPendingChanges: syncStatus.pendingCount > 0,
  };
}

export default useOfflineSync;
