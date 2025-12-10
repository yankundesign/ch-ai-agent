export type AgentCategory = 'License optimization' | 'Meeting quality' | 'Security' | 'Automation' | 'Device management' | 'GenAI' | 'Other';

export type AgentSource = 'controlHub' | 'org';

export type AgentStatus = 'active' | 'draft' | 'paused' | 'failing';

export type Agent = {
  id: string;
  name: string;
  category: AgentCategory;
  description: string;
  source: AgentSource;        // 'controlHub' for "Made by Control Hub", 'org' for "Your organization"
  owner?: string;             // only for org agents
  team?: string;              // only for org agents
  lastRunAt?: string;         // ISO string, can be undefined if never run
  successRate?: number;       // 0–100, optional
  status: AgentStatus;
  environment?: 'dev' | 'test' | 'prod';
};

