import type { KnowledgeType, KnowledgeStatus } from '../types/knowledge.types';

/**
 * Formats date as relative time or absolute date
 */
export function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = Date.now();
  const diffMs = now - date.getTime();
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  
  // For older dates, show formatted date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Returns icon name based on knowledge type
 */
export function getTypeIcon(type: KnowledgeType) {
  const iconMap = {
    'PDF': 'document-regular' as const,
    'Website': 'browser-regular' as const,
    'JSON': 'file-code-regular' as const,
    'Markdown': 'file-text-regular' as const,
  };
  return iconMap[type] || ('document-regular' as const);
}

/**
 * Returns status badge color/variant based on knowledge status
 */
export function getStatusVariant(status: KnowledgeStatus): 'success' | 'warning' | 'error' {
  const variantMap: Record<KnowledgeStatus, 'success' | 'warning' | 'error'> = {
    'ready': 'success',
    'indexing': 'warning',
    'error': 'error',
  };
  return variantMap[status];
}

/**
 * Returns status label text
 */
export function getStatusLabel(status: KnowledgeStatus): string {
  const labelMap: Record<KnowledgeStatus, string> = {
    'ready': 'Ready',
    'indexing': 'Indexing...',
    'error': 'Error',
  };
  return labelMap[status];
}

