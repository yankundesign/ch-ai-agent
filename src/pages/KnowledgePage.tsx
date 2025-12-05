import React, { useCallback } from 'react';
import { Button, Text } from '@momentum-design/components/react';
import { KnowledgeTable } from '../components/knowledgetable/KnowledgeTable';
import { mockKnowledge } from '../data/mockKnowledge';
import type { KnowledgeItem } from '../types/knowledge.types';
import './knowledgepage.css';

const KnowledgePage: React.FC = () => {
  const handleAddContent = useCallback(() => {
    console.log('Add content clicked');
  }, []);

  const handleAction = useCallback((item: KnowledgeItem, action: string) => {
    console.log(`Action: ${action}`, item);
  }, []);

  return (
    <div className="knowledge-page-content">
      <div className="knowledge-page-header-row">
        <Text type="heading-small-bold" tagname="h2">
          Knowledge
        </Text>
        <Button variant="primary" onClick={handleAddContent}>
          Add content
        </Button>
      </div>
      
      <KnowledgeTable items={mockKnowledge} onAction={handleAction} />
    </div>
  );
};

export default KnowledgePage;

