import type { Agent } from '../types/agent.types';

/**
 * Converts ISO date string to relative time (e.g., "2h ago", "5m ago")
 */
export function formatLastRun(lastRunAt: string | undefined): string {
  if (!lastRunAt) return 'Never';
  
  const now = Date.now();
  const runTime = new Date(lastRunAt).getTime();
  const diffMs = now - runTime;
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/**
 * Formats success rate as percentage string
 */
export function formatSuccessRate(rate: number | undefined): string {
  if (rate === undefined) return 'N/A';
  return `${rate}%`;
}

/**
 * Computes health/status text for agent cards
 */
export function getHealthText(agent: Agent): string {
  if (agent.status === 'draft') {
    return 'Draft';
  }
  
  if (agent.status === 'paused') {
    return 'Paused';
  }
  
  if (agent.status === 'failing') {
    return `Last run: failed`;
  }
  
  if (!agent.lastRunAt) {
    return 'Not yet run';
  }
  
  const lastRun = formatLastRun(agent.lastRunAt);
  
  if (agent.successRate !== undefined) {
    return `Last run: ${lastRun} · ${agent.successRate}% success`;
  }
  
  return `Last run: ${lastRun}`;
}

