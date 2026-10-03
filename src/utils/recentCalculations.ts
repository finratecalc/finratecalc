import { CalculationHistoryItem, CalculatorId, CurrencyCode } from '../types/financial';

const STORAGE_KEY = 'fincalc_recent_calculations';
const MAX_HISTORY_ITEMS = 5;

export const RECENT_CALCULATIONS_EVENT = 'fincalc_recent_calculations_updated';

export function getRecentCalculations(): CalculationHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY_ITEMS);
    }
    return [];
  } catch (err) {
    console.error('Error reading recent calculations:', err);
    return [];
  }
}

export function saveRecentCalculation(item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentCalculations();
    
    // Check if identical to the latest one to avoid rapid redundant saves while typing
    const latest = current[0];
    const isDuplicate =
      latest &&
      latest.calculatorId === item.calculatorId &&
      JSON.stringify(latest.inputs) === JSON.stringify(item.inputs) &&
      latest.currency === item.currency;

    if (isDuplicate) return;

    // Filter out identical calculation if it existed earlier in the list
    const filtered = current.filter(
      (c) =>
        !(
          c.calculatorId === item.calculatorId &&
          JSON.stringify(c.inputs) === JSON.stringify(item.inputs)
        )
    );

    const newItem: CalculationHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch event so UI components update instantly
    window.dispatchEvent(new CustomEvent(RECENT_CALCULATIONS_EVENT, { detail: updated }));
  } catch (err) {
    console.error('Error saving recent calculation:', err);
  }
}

export function deleteRecentCalculation(id: string): CalculationHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentCalculations();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(RECENT_CALCULATIONS_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error deleting recent calculation:', err);
    return [];
  }
}

export function clearRecentCalculations(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(RECENT_CALCULATIONS_EVENT, { detail: [] }));
  } catch (err) {
    console.error('Error clearing recent calculations:', err);
  }
}

/**
 * Format relative time (e.g., "Just now", "2m ago", "1h ago", "Yesterday")
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
