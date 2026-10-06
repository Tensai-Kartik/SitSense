import { AnalyticsDataPoint, BreakEvent, HistoricalSessionRecord } from '../types';

const DB_NAME = 'ErgoSenseLocalDB';
const DB_VERSION = 1;
const STORE_ANALYTICS = 'analytics_timeline';
const STORE_BREAKS = 'breaks_history';
const STORE_SESSIONS = 'sessions_history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ANALYTICS)) {
        const store = db.createObjectStore(STORE_ANALYTICS, { keyPath: 'timestamp' });
        store.createIndex('timestamp', 'timestamp', { unique: true });
      }
      if (!db.objectStoreNames.contains(STORE_BREAKS)) {
        const store = db.createObjectStore(STORE_BREAKS, { keyPath: 'id' });
        store.createIndex('startTime', 'startTime', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const store = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

export async function logAnalyticsPoint(point: AnalyticsDataPoint): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ANALYTICS, 'readwrite');
    tx.objectStore(STORE_ANALYTICS).put(point);
  } catch (e) {
    // Non-blocking fallback for private windows or disabled IDB
    console.warn('IDB write point error', e);
  }
}

export async function logBreakEvent(breakEvent: BreakEvent): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_BREAKS, 'readwrite');
    tx.objectStore(STORE_BREAKS).put(breakEvent);
  } catch (e) {
    console.warn('IDB break write error', e);
  }
}

export async function logHistoricalSession(session: HistoricalSessionRecord): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    tx.objectStore(STORE_SESSIONS).put(session);
  } catch (e) {
    console.warn('IDB session write error', e);
  }
}

export async function getAnalyticsPoints(sinceTimestamp: number): Promise<AnalyticsDataPoint[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ANALYTICS, 'readonly');
      const store = tx.objectStore(STORE_ANALYTICS);
      const range = IDBKeyRange.lowerBound(sinceTimestamp);
      const req = store.getAll(range);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getBreakEvents(sinceTimestamp: number): Promise<BreakEvent[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BREAKS, 'readonly');
      const store = tx.objectStore(STORE_BREAKS);
      const req = store.getAll();
      req.onsuccess = () => {
        const list: BreakEvent[] = req.result || [];
        resolve(list.filter(b => b.startTime >= sinceTimestamp));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getHistoricalSessions(): Promise<HistoricalSessionRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SESSIONS, 'readonly');
      const store = tx.objectStore(STORE_SESSIONS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function purgeOldRecords(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<{ purgedCount: number }> {
  try {
    const cutoff = Date.now() - maxAgeMs;
    const db = await openDB();
    
    // Purge analytics
    const tx = db.transaction([STORE_ANALYTICS, STORE_BREAKS], 'readwrite');
    const analyticsStore = tx.objectStore(STORE_ANALYTICS);
    const range = IDBKeyRange.upperBound(cutoff);
    analyticsStore.delete(range);

    return { purgedCount: 1 };
  } catch {
    return { purgedCount: 0 };
  }
}

export async function clearAllLocalDatabase(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_ANALYTICS, STORE_BREAKS, STORE_SESSIONS], 'readwrite');
    tx.objectStore(STORE_ANALYTICS).clear();
    tx.objectStore(STORE_BREAKS).clear();
    tx.objectStore(STORE_SESSIONS).clear();
  } catch (e) {
    console.error('Failed to clear IDB database', e);
  }
}
