/**
 * Sync Engine - Handles offline mutations and background sync
 * Implements optimistic UI with conflict resolution
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { API_URL } from '@/config/api';
import {
  getPendingSyncItems,
  removeSyncItem,
  markSyncError,
  addToSyncQueue,
} from './database';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncAt: Date | null;
  lastError: string | null;
}

let syncState: SyncState = {
  status: 'idle',
  pendingCount: 0,
  lastSyncAt: null,
  lastError: null,
};

let listeners: ((state: SyncState) => void)[] = [];
let isConnected = true;
let syncInProgress = false;

// Subscribe to sync state changes
export function subscribeSyncState(callback: (state: SyncState) => void): () => void {
  listeners.push(callback);
  callback(syncState); // Emit current state
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l(syncState));
}

function updateSyncState(updates: Partial<SyncState>) {
  syncState = { ...syncState, ...updates };
  notifyListeners();
}

// Initialize network listener
export function initSyncEngine() {
  NetInfo.addEventListener((state: NetInfoState) => {
    const wasOffline = !isConnected;
    isConnected = state.isConnected ?? false;
    
    if (wasOffline && isConnected) {
      // Came back online - trigger sync
      console.log('[SyncEngine] Back online, starting sync...');
      syncPendingMutations();
    }
    
    if (!isConnected) {
      updateSyncState({ status: 'offline' });
    }
  });
}

// Queue a mutation for sync
export async function queueMutation(
  entityType: 'workout' | 'set' | 'exercise' | 'routine',
  entityId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  payload: any,
  accessToken?: string
): Promise<void> {
  // Store mutation in queue
  await addToSyncQueue(entityType, entityId, action, {
    ...payload,
    accessToken,
  });
  
  updateSyncState({ pendingCount: syncState.pendingCount + 1 });
  
  // If online, sync immediately
  if (isConnected && !syncInProgress) {
    syncPendingMutations();
  }
}

// Process pending mutations
export async function syncPendingMutations(): Promise<void> {
  if (syncInProgress || !isConnected) return;
  
  syncInProgress = true;
  updateSyncState({ status: 'syncing' });
  
  try {
    const pendingItems = await getPendingSyncItems();
    
    if (pendingItems.length === 0) {
      updateSyncState({ status: 'idle', pendingCount: 0 });
      syncInProgress = false;
      return;
    }
    
    for (const item of pendingItems) {
      if (!isConnected) break; // Stop if we go offline
      
      try {
        const payload = JSON.parse(item.payload);
        await processSyncItem(item.entity_type, item.action, payload);
        await removeSyncItem(item.id);
        updateSyncState({ pendingCount: Math.max(0, syncState.pendingCount - 1) });
      } catch (error: any) {
        console.error('[SyncEngine] Sync error:', error.message);
        await markSyncError(item.id, error.message);
        
        // If it's a permanent error (4xx), remove from queue
        if (error.status >= 400 && error.status < 500) {
          await removeSyncItem(item.id);
        }
      }
    }
    
    updateSyncState({ 
      status: 'idle', 
      lastSyncAt: new Date(),
      lastError: null,
    });
  } catch (error: any) {
    console.error('[SyncEngine] Fatal sync error:', error);
    updateSyncState({ status: 'error', lastError: error.message });
  } finally {
    syncInProgress = false;
  }
}

async function processSyncItem(
  entityType: string,
  action: string,
  payload: any
): Promise<void> {
  const { accessToken, ...data } = payload;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  let endpoint: string;
  let method: string;
  
  switch (entityType) {
    case 'workout':
      if (action === 'CREATE') {
        endpoint = `${API_URL}/strength/workouts`;
        method = 'POST';
      } else if (action === 'UPDATE') {
        endpoint = `${API_URL}/strength/workouts/${data.id}`;
        method = 'PATCH';
      } else {
        endpoint = `${API_URL}/strength/workouts/${data.id}`;
        method = 'DELETE';
      }
      break;
      
    case 'set':
      if (action === 'CREATE') {
        endpoint = `${API_URL}/strength/workout-exercises/${data.workoutExerciseId}/sets`;
        method = 'POST';
      } else if (action === 'UPDATE') {
        endpoint = `${API_URL}/strength/sets/${data.id}`;
        method = 'PATCH';
      } else {
        endpoint = `${API_URL}/strength/sets/${data.id}`;
        method = 'DELETE';
      }
      break;
      
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  const response = await fetch(endpoint, {
    method,
    headers,
    body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const error: any = new Error(`Sync failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
}

// Force sync (manual trigger)
export async function forceSync(): Promise<void> {
  if (!isConnected) {
    throw new Error('Cannot sync while offline');
  }
  await syncPendingMutations();
}

// Get current sync state
export function getSyncState(): SyncState {
  return { ...syncState };
}

// Check if online
export function isOnline(): boolean {
  return isConnected;
}

export default {
  initSyncEngine,
  queueMutation,
  syncPendingMutations,
  forceSync,
  getSyncState,
  isOnline,
  subscribeSyncState,
};
