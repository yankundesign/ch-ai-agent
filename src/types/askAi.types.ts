export type ChatRole = 'system' | 'assistant' | 'user';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface UserSummary {
  name: string;
  email?: string;
}

export interface RunSummary {
  id?: string;
  status: 'idle' | 'running' | 'awaitingApproval' | 'completed';
  durationSeconds?: number;
  settingsChangedCount?: number;
}

export interface CallingSettingRow {
  setting: string;
  currentValue: string;
  newValue: string;
  isChanged: boolean;
  isDangerous?: boolean;
}

export interface AskAiTabProps {
  agentName: string;
  sourceUser?: UserSummary;
  targetUser?: UserSummary;
  runSummary: RunSummary;
  settingsDiff?: CallingSettingRow[];
}

