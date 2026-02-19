/**
 * Automatic data refresh scheduler
 * Periodically refreshes politician data from backend
 */

let refreshInterval: NodeJS.Timeout | null = null;
let isRefreshing = false;

const getAPI_URL = () => {
  try {
    if (typeof window !== 'undefined' && window.location) {
      return ''; // Relative path, relies on Vite proxy or same-origin in production
    }
  } catch (e) {
    console.debug('Error resolving API URL:', e);
  }
  return '';
};

/**
 * Fetch fresh politician data from backend
 */
async function refreshPoliticianData() {
  if (isRefreshing) return; // Prevent concurrent refreshes
  
  isRefreshing = true;
  try {
    const apiUrl = getAPI_URL();
    const response = await fetch(`${apiUrl}/api/fetch-real-data`, {

      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.success && data.politicians?.length > 0) {
      console.info(`[Scheduler] ✓ Refreshed ${data.politicians.length} politicians`);
      localStorage.setItem('neta_politicians', JSON.stringify(data.politicians));
      window.dispatchEvent(new CustomEvent('politiciansRefreshed', { detail: data.politicians }));
    }
  } catch (error: any) {
    console.debug('[Scheduler] Refresh failed:', error?.message || error);
  } finally {
    isRefreshing = false;
  }
}

/**
 * Start automatic refresh scheduler
 * @param intervalMinutes Refresh interval in minutes (default: 60)
 */
export function startAutoRefresh(intervalMinutes: number = 60) {
  if (refreshInterval) {
    console.warn('[Scheduler] Auto-refresh already started');
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;
  console.info(`[Scheduler] Starting auto-refresh every ${intervalMinutes} minutes`);
  
  // Initial refresh
  refreshPoliticianData();
  
  // Schedule periodic refreshes
  refreshInterval = setInterval(refreshPoliticianData, intervalMs);
}

/**
 * Stop automatic refresh scheduler
 */
export function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.info('[Scheduler] Auto-refresh stopped');
  }
}

/**
 * Manually trigger a refresh
 */
export function manualRefresh() {
  console.debug('[Scheduler] Manual refresh triggered');
  return refreshPoliticianData();
}

/**
 * Get refresh status
 */
export function getRefreshStatus() {
  return {
    isRunning: refreshInterval !== null,
    isRefreshing,
  };
}
