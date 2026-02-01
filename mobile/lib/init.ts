/**
 * App Initialization
 * Initialize database and sync engine on app start
 * Gracefully handles failures in Expo Go where some native modules aren't available
 */

let initialized = false;

export async function initializeApp(): Promise<void> {
  if (initialized) return;
  
  // Database initialization - may fail in Expo Go
  try {
    console.log('[App] Initializing database...');
    const { initDatabase } = await import('./database');
    await initDatabase();
    console.log('[App] Database initialized');
  } catch (error) {
    console.warn('[App] Database init failed (OK in Expo Go):', error);
    // Continue without database - app will work with API only
  }
  
  // Sync engine - depends on database
  try {
    console.log('[App] Starting sync engine...');
    const { initSyncEngine } = await import('./syncEngine');
    initSyncEngine();
    console.log('[App] Sync engine started');
  } catch (error) {
    console.warn('[App] Sync engine failed (OK in Expo Go):', error);
  }
  
  initialized = true;
  console.log('[App] Initialization complete');
}

export function isAppInitialized(): boolean {
  return initialized;
}

export default { initializeApp, isAppInitialized };
