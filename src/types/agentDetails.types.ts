export type InputType = 'Email' | 'String' | 'Number' | 'Boolean' | 'Date' | 'JSON';

export type WorkflowStepType = 'fetch' | 'validate' | 'transform' | 'action' | 'knowledge';

export type RunStatus = 'success' | 'failed' | 'running' | 'cancelled';

export interface AgentInput {
  id: string;
  label: string;
  type: InputType;
  required: boolean;
  description?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  knowledgeDocs?: string[];
}

export interface AgentMetrics {
  successRate: number; // 0-100
  avgDuration: number; // in seconds
  totalRuns: number;
  lastRunTime?: string;
}

export interface Guardrail {
  id: string;
  label: string;
  iconType: 'shield' | 'lock' | 'clock';
  enabled: boolean;
}

export interface RunHistory {
  id: string;
  user: string;
  timestamp: string;
  status: RunStatus;
  duration?: number;
}

export interface AgentDetails {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'draft' | 'paused' | 'failing';
  category: string;
  complexity?: string; // e.g., "Low Risk", "High Impact"
  description: string;
  expectedOutcome: string;
  riskLevel?: 'safe' | 'moderate' | 'high';
  documentationUrl?: string;
  owner: {
    name: string;
    team?: string;
    avatarInitials?: string;
    avatar?: string;
  };
  lastUpdated: string;
  inputs: AgentInput[];
  workflow: WorkflowStep[];
  hasKnowledge: boolean;
  knowledgeSources?: string[];
  metrics: AgentMetrics;
  guardrails: Guardrail[];
  recentRuns: RunHistory[];
}
