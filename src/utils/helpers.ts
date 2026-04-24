let counter = 100;

export function generateId(prefix: string): string {
  return `${prefix}-${++counter}-${Date.now().toString(36)}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
