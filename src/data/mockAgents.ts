import type { Agent } from '../types/agent.types';

export const mockAgents: Agent[] = [
  // Control Hub agents (templates)
  {
    id: 'ch-1',
    name: 'License Optimizer Pro',
    category: 'License optimization',
    description: 'Automatically identifies unused licenses and suggests optimization opportunities to reduce costs.',
    source: 'controlHub',
    status: 'active',
    lastRunAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: 'ch-2',
    name: 'Meeting Quality Monitor',
    category: 'Meeting quality',
    description: 'Tracks meeting quality metrics and provides insights to improve collaboration effectiveness.',
    source: 'controlHub',
    status: 'active',
    lastRunAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'ch-3',
    name: 'Security Compliance Checker',
    category: 'Security',
    description: 'Monitors security compliance across your organization and alerts on policy violations.',
    source: 'controlHub',
    status: 'active',
    lastRunAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  
  // Organization agents
  {
    id: 'org-1',
    name: 'Sales Call Summarizer',
    category: 'Automation',
    description: 'Automatically generates summaries of sales calls and extracts key action items.',
    source: 'org',
    owner: 'Sarah Johnson',
    team: 'Sales Operations',
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    successRate: 98,
    status: 'active',
  },
  {
    id: 'org-2',
    name: 'Onboarding Assistant',
    category: 'Automation',
    description: 'Guides new employees through the onboarding process and answers common questions.',
    source: 'org',
    owner: 'Mike Chen',
    team: 'HR',
    lastRunAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    successRate: 95,
    status: 'active',
  },
  {
    id: 'org-3',
    name: 'License Usage Reporter',
    category: 'License optimization',
    description: 'Weekly report on license utilization across departments.',
    source: 'org',
    owner: 'David Park',
    team: 'IT Operations',
    lastRunAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    successRate: 100,
    status: 'active',
  },
];

