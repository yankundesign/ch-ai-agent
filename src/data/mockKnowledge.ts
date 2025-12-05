import type { KnowledgeItem } from '../types/knowledge.types';

export const mockKnowledge: KnowledgeItem[] = [
  {
    id: 'k-1',
    name: 'IT Support Handbook',
    type: 'PDF',
    status: 'ready',
    linkedAgents: 3,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'k-2',
    name: 'Company Intranet Portal',
    type: 'Website',
    status: 'indexing',
    linkedAgents: 0,
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: 'k-3',
    name: 'Product API Documentation',
    type: 'JSON',
    status: 'error',
    linkedAgents: 1,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: 'k-4',
    name: 'Employee Onboarding Guide',
    type: 'Markdown',
    status: 'ready',
    linkedAgents: 5,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: 'k-5',
    name: 'Security Policies & Procedures',
    type: 'PDF',
    status: 'ready',
    linkedAgents: 2,
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
  },
  {
    id: 'k-6',
    name: 'Customer FAQ Database',
    type: 'Website',
    status: 'ready',
    linkedAgents: 4,
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

