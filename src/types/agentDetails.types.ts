export type InputType = 'Email' | 'String' | 'Number' | 'Boolean' | 'Date' | 'JSON';

export type WorkflowStepType = 'fetch' | 'validate' | 'transform' | 'action' | 'knowledge';

export type RunStatus = 'success' | 'failed' | 'running' | 'cancelled';

export interface AdvancedSettings {
  numbersIdentity: boolean;              // Numbers & identity
  voicemailGreetings: boolean;          // Voicemail & greetings
  callHandlingRules: boolean;           // Call handling rules & schedules
  betweenUserPermissions: boolean;      // Monitoring / barge-in / exec assistant
  userExperienceIntegrations: boolean;  // Feature access & integrations
  recordingAgentSettings: boolean;      // Recording / agent / receptionist settings
}

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
  // Reliability
  successRate: number; // 0–100

  // Usage / adoption
  runsLast30Days: number;
  uniqueAdmins: number;

  // Impact
  usersMigrated: number; // target users who inherited settings

  // Safety / guardrails
  guardrailBlocks: number; // runs stopped by approval/safety checks
  incidentsReported: number; // major incidents related to this agent

  // Optional: keep existing fields if used elsewhere
  averageDurationSeconds?: number;
  totalRuns?: number;
  lastRunTime?: string;
  
  // Legacy fields (deprecated, kept for backward compatibility)
  avgDuration?: number;
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
  whenToUse?: string;
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
