import React from 'react';
import { Chip, Text } from '@momentum-design/components/react';
import type { Agent } from '../../types/agent.types';
import { getHealthText } from '../../utils/agentHelpers';
import './agentcard.css';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  const isControlHub = agent.source === 'controlHub';
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking the action button
    if ((e.target as HTMLElement).closest('.agent-card-action')) {
      return;
    }
    onClick();
  };
  
  return (
    <div className="agent-card" onClick={handleCardClick}>
      <div className="agent-card-header">
        <Text type="body-large-bold" tagname="div" className="agent-card-name">
          {agent.name}
        </Text>
        <Chip label={agent.category} size={24} />
      </div>
      
      <div className="agent-card-description">
        <Text type="body-midsize-medium" tagname="p">
          {agent.description}
        </Text>
      </div>
      
      {!isControlHub && (
        <div className="agent-card-meta">
          {agent.owner && (
            <Text type="body-small-medium" tagname="span" className="agent-card-meta-item">
              Owner: {agent.owner}
            </Text>
          )}
          {agent.team && (
            <Text type="body-small-medium" tagname="span" className="agent-card-meta-item">
              Team: {agent.team}
            </Text>
          )}
        </div>
      )}
      
      <div className="agent-card-health">
        <Text type="body-small-medium" tagname="div" className={`agent-card-health-text ${agent.status === 'failing' ? 'failing' : ''}`}>
          {getHealthText(agent)}
        </Text>
      </div>
    </div>
  );
};

export default AgentCard;

