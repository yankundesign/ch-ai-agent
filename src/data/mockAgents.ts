import type { Agent } from '../types/agent.types';

export const mockAgents: Agent[] = [
  // Control Hub agents (templates)
  {
    id: 'ch-1',
    name: 'Calling settings transfer',
    category: 'Automation',
    description: 'Automatically transfer calling settings from one user to another.',
    source: 'controlHub',
    status: 'active',
    successRate: 97,
    lastRunAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: 'ch-2',
    name: 'Bulk device onboarding',
    category: 'Device management',
    description: 'Adds and configures large batches of Webex devices in one run, assigning them to workspaces, locations, and default policies.',
    source: 'controlHub',
    status: 'active',
    successRate: 94,
    lastRunAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'ch-3',
    name: 'Security compliance checker',
    category: 'Security',
    description: 'Monitors security compliance across your organization and alerts on policy violations.',
    source: 'controlHub',
    status: 'active',
    successRate: 99,
    lastRunAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  
  // Organization agents
  {
    id: 'org-1',
    name: 'Executive room readiness checker',
    category: 'Automation',
    description: 'Runs pre-meeting checks on executive boardrooms (devices, network, calendar) and alerts IT if anything looks misconfigured before key events.',
    source: 'org',
    owner: 'Sarah Johnson',
    team: 'IT Operations',
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    successRate: 98,
    status: 'active',
  },
  {
    id: 'org-2',
    name: 'Onboarding assistant',
    category: 'Automation',
    description: 'Guides new employees through the onboarding process and answers common questions.',
    source: 'org',
    owner: 'Mike Chen',
    team: 'IT Operations',
    lastRunAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    successRate: 95,
    status: 'active',
  },
  {
    id: 'org-3',
    name: 'License usage reporter',
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

