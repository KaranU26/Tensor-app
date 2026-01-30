/**
 * App Initialization
 * Initialize database and sync engine on app start
 */

import { initDatabase } from './database';
import { initSyncEngine } from './syncEngine';

let initialized = false;

export async function initializeApp(): Promise<void> {
  if (initialized) return;
  
  try {
    console.log('[App] Initializing database...');
    await initDatabase();
    
    console.log('[App] Starting sync engine...');
    initSyncEngine();
    
    initialized = true;
    console.log('[App] Initialization complete');
  } catch (error) {
    console.error('[App] Initialization failed:', error);
    throw error;
  }
}

export function isAppInitialized(): boolean {
  return initialized;
}

export default { initializeApp, isAppInitialized };
