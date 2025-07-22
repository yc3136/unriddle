// Error logger for unriddle extension (single source of truth)
export interface ErrorLogEntry {
  message: string;
  name?: string;
  stack?: string;
  context?: any;
  timestamp: string;
  extensionVersion?: string;
  browserVersion?: string;
}

export function sanitizeError(error: any): Partial<ErrorLogEntry> {
  if (!error) return { message: 'Unknown error' };
  if (typeof error === 'string') return { message: error };
  return {
    message: error.message || String(error),
    name: error.name,
    stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : undefined // limit stack
  };
}

export async function logError(error: any, context?: any) {
  const sanitized = sanitizeError(error);
  const entry: ErrorLogEntry = {
    message: sanitized.message || 'Unknown error',
    name: sanitized.name,
    stack: sanitized.stack,
    context: context ? JSON.stringify(context) : undefined,
    timestamp: new Date().toISOString(),
    extensionVersion: (chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest().version : undefined,
    browserVersion: navigator.userAgent
  };
  try {
    const { unriddleErrorLogs = [] } = await chrome.storage.local.get('unriddleErrorLogs');
    unriddleErrorLogs.push(entry);
    await chrome.storage.local.set({ unriddleErrorLogs });
  } catch (e) {
    // Fallback: log to console if storage fails
    console.error('Failed to log error:', entry, e);
  }
}

export async function getErrorLogs(): Promise<ErrorLogEntry[]> {
  const { unriddleErrorLogs = [] } = await chrome.storage.local.get('unriddleErrorLogs');
  return unriddleErrorLogs;
}

export async function clearErrorLogs() {
  await chrome.storage.local.remove('unriddleErrorLogs');
}

if (typeof window !== 'undefined') {
  (window as any).logError = logError;
  (window as any).sanitizeError = sanitizeError;
  (window as any).getErrorLogs = getErrorLogs;
  (window as any).clearErrorLogs = clearErrorLogs;
} 