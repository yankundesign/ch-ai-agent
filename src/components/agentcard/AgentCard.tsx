import React from 'react';
import { Avatar, Text, ToggleTip } from '@momentum-design/components/react';
import type { Agent, AgentCategory } from '../../types/agent.types';
import { getHealthText } from '../../utils/agentHelpers';
import './agentcard.css';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

// Get category badge color
const getCategoryColor = (category: AgentCategory): string => {
  const colorMap: Record<AgentCategory, string> = {
    'Security': 'category-security',
    'Automation': 'category-automation',
    'License optimization': 'category-license',
    'Meeting quality': 'category-meeting',
    'Other': 'category-default'
  };
  return colorMap[category] || 'category-default';
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

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
        <div className={`agent-card-category-badge ${getCategoryColor(agent.category)}`}>
          {agent.category}
        </div>
      </div>
      
      <div className="agent-card-description">
        <Text type="body-midsize-medium" tagname="p">
          {agent.description}
        </Text>
      </div>
      
      {!isControlHub && (
        <div className="agent-card-meta">
          {agent.owner && (
            <>
              <Avatar 
                size={24} 
                title={agent.owner}
                initials={getInitials(agent.owner)}
                className="agent-card-avatar"
              />
              <ToggleTip triggerID={`avatar-${agent.id}`} placement='top'>
                {agent.owner}
              </ToggleTip>
            </>
          )}
          {agent.team && (
            <Text type="body-small-medium" tagname="span" className="agent-card-meta-item">
              {agent.team}
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

