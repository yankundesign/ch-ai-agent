export type KnowledgeType = 'PDF' | 'Website' | 'JSON' | 'Markdown';

export type KnowledgeStatus = 'ready' | 'indexing' | 'error';

export type KnowledgeItem = {
  id: string;
  name: string;
  type: KnowledgeType;
  status: KnowledgeStatus;
  linkedAgents: number;
  lastUpdated: string;
};

