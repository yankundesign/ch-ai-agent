import React from 'react';
import { Avatar, Text, Button, Icon, Chip } from '@momentum-design/components/react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockAgentDatabase } from '../data/mockAgentDetails';
import type { AgentDetails, WorkflowStep, AgentInput, Guardrail, RunHistory } from '../types/agentDetails.types';
import { getGuardrailIcon } from '../utils/iconMapping';
import './agentdetailspage.css';

const AgentDetailsPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  
  // Fetch agent from database by ID, default to first agent if not found or no ID provided
  const agent: AgentDetails = agentId 
    ? (mockAgentDatabase.find(a => a.id === agentId) || mockAgentDatabase[0])
    : mockAgentDatabase[0];

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'status-success';
      case 'failed': return 'status-error';
      case 'running': return 'status-warning';
      default: return 'status-default';
    }
  };

  return (
    <div className="agent-details-wrapper">
      {/* Header Section */}
      <div className="agent-details-header">
        <div className="agent-details-breadcrumbs">
          <Text 
            type="body-small-medium" 
            tagname="span" 
            className="breadcrumb-item"
            onClick={() => navigate('/ai-agent')}
          >
            AI Agents
          </Text>
          <Icon name="arrow-right-regular" size={16} />
          <Text type="body-small-medium" tagname="span" className="breadcrumb-current">{agent.name}</Text>
        </div>
        
        <div className="agent-details-title-row">
          <div className="agent-details-title-left">
            <Text type="heading-large-bold" tagname="h1">{agent.name}</Text>
            <Chip label={agent.version} size={24} />
            <div className={`agent-status-indicator status-${agent.status}`}>
              {agent.status}
            </div>
          </div>
          <div className="agent-details-actions">
            <Button 
              variant="primary" 
              prefixIcon="play-circle-regular"
              onClick={() => navigate(`/ai-agent/${agent.id}/run`)}
            >
              Run Agent
            </Button>
            <Button variant="secondary" prefixIcon="diagnostics-regular">
              Test
            </Button>
            <Button variant="tertiary" size={32} prefixIcon="edit-regular" aria-label="Edit agent" />
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="agent-details-grid">
        {/* Left Column */}
        <div className="agent-details-column-left">
          {/* Overview Card */}
          <div className="agent-details-card">
            <Text type="heading-small-bold" tagname="h3" className="card-title">Agent overview</Text>
            <div className="card-content">
              {/* Top Row - Badges */}
              <div className="overview-badges">
                <span className="category-badge">{agent.category}</span>
                {agent.complexity && (
                  <span className="complexity-badge">{agent.complexity}</span>
                )}
                {agent.riskLevel === 'safe' && (
                  <span className="risk-badge">Safe to Run</span>
                )}
              </div>

              {/* Description */}
              <div className="overview-section">
                <Text type="body-midsize-medium" tagname="p" className="agent-description">
                  {agent.description}
                </Text>
              </div>

              {/* Expected Outcome */}
              {agent.expectedOutcome && (
                <div className="expected-outcome-block">
                  <Text type="body-small-bold" tagname="div" className="expected-outcome-label">
                    EXPECTED OUTCOME
                  </Text>
                  <Text type="body-midsize-medium" tagname="p" className="expected-outcome-text">
                    {agent.expectedOutcome}
                  </Text>
                </div>
              )}

              {/* Footer - Owner and Documentation Link */}
              <div className="overview-footer">
                <div className="owner-section">
                  <Avatar 
                    size={32} 
                    initials={agent.owner.avatarInitials || getInitials(agent.owner.name)} 
                    title={agent.owner.name} 
                  />
                  <div className="meta-text">
                    <Text type="body-small-medium" tagname="div">Owner</Text>
                    <Text type="body-midsize-medium" tagname="div">{agent.owner.name}</Text>
                    {agent.owner.team && (
                      <Text type="body-small-medium" tagname="div" className="owner-team">
                        {agent.owner.team}
                      </Text>
                    )}
                  </div>
                </div>
                {agent.documentationUrl && (
                  <button 
                    className="doc-link"
                    onClick={() => window.open(agent.documentationUrl, '_blank')}
                  >
                    <Text type="body-small-medium" tagname="span">View Documentation</Text>
                    <Icon name="pop-out-regular" size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Inputs Card */}
          <div className="agent-details-card">
            <Text type="heading-small-bold" tagname="h3" className="card-title">Triggers & Inputs</Text>
            <div className="card-content">
              <div className="inputs-list">
                {agent.inputs.map((input: AgentInput) => (
                  <div key={input.id} className="input-item">
                    <div className="input-name-row">
                      <Text type="body-large-bold" tagname="span" className="input-name">
                        {input.label}
                        {input.required && <span className="required-asterisk">*</span>}
                      </Text>
                      <span className="input-type-mono">{input.type}</span>
                    </div>
                    {input.description && (
                      <Text type="body-small-medium" tagname="p" className="input-description">{input.description}</Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="agent-details-column-center">
          <div className="agent-details-card workflow-card">
            <Text type="heading-small-bold" tagname="h3" className="card-title">Workflow Pipeline</Text>
            <div className="card-content">
              <div className="workflow-visualization">
                {agent.workflow.map((step: WorkflowStep, index: number) => (
                  <div key={step.id} className="workflow-step-timeline">
                    <div className="timeline-track">
                      <div className="step-icon-circle">
                        <Icon name={step.icon as any} size={20} />
                      </div>
                      {index < agent.workflow.length - 1 && <div className="timeline-connector" />}
                    </div>
                    <div className="step-content">
                      <Text type="body-large-bold" tagname="div">{step.title}</Text>
                      {step.description && (
                        <Text type="body-small-medium" tagname="p" className="step-description">
                          {step.description}
                        </Text>
                      )}
                      {step.knowledgeDocs && step.knowledgeDocs.length > 0 && (
                        <div className="step-knowledge-docs">
                          {step.knowledgeDocs.map((doc, docIndex) => (
                            <div key={docIndex} className="knowledge-doc-inline">
                              <Icon name="document-regular" size={14} />
                              <Text type="body-small-medium" tagname="span">{doc}</Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {agent.hasKnowledge && agent.knowledgeSources && (
                <div className="knowledge-section">
                  <div className="knowledge-header">
                    <Icon name="attachment-regular" size={18} />
                    <Text type="body-midsize-bold" tagname="h4">Knowledge Sources</Text>
                  </div>
                  <div className="knowledge-attachments">
                    {agent.knowledgeSources.map((source, index) => (
                      <div key={index} className="knowledge-attachment-item">
                        <Icon name="document-regular" size={16} />
                        <Text type="body-midsize-medium" tagname="span">{source}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="agent-details-column-right">
          {/* Metrics Card */}
          <div className="agent-details-card">
            <Text type="heading-small-bold" tagname="h3" className="card-title">Metrics</Text>
            <div className="card-content">
              <div className="metrics-grid">
                <div className="metric-item">
                  <Text type="body-small-medium" tagname="div" className="metric-label">Success Rate</Text>
                  <Text type="heading-large-bold" tagname="div" className="metric-value">{agent.metrics.successRate}%</Text>
                </div>
                <div className="metric-item">
                  <Text type="body-small-medium" tagname="div" className="metric-label">Avg Duration</Text>
                  <Text type="heading-large-bold" tagname="div" className="metric-value">{agent.metrics.avgDuration}s</Text>
                </div>
              </div>
              <div className="metric-secondary">
                <Text type="body-small-medium" tagname="span">Total Runs: {agent.metrics.totalRuns}</Text>
              </div>
            </div>
          </div>

          {/* Guardrails Card */}
          <div className="agent-details-card">
            <Text type="heading-small-bold" tagname="h3" className="card-title">Guardrails</Text>
            <div className="card-content">
              <div className="guardrails-list">
                {agent.guardrails.map((guardrail: Guardrail) => (
                  <div key={guardrail.id} className="guardrail-item">
                    <Icon name={getGuardrailIcon(guardrail.iconType) as any} size={16} />
                    <Text type="body-midsize-medium" tagname="span">{guardrail.label}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Runs Card */}
          <div className="agent-details-card">
            <Text type="heading-small-bold" tagname="h3" className="card-title">Recent Runs</Text>
            <div className="card-content">
              <div className="runs-list">
                {agent.recentRuns.map((run: RunHistory) => (
                  <div key={run.id} className="run-item">
                    <Avatar size={24} initials={getInitials(run.user)} title={run.user} />
                    <div className="run-info">
                      <Text type="body-small-medium" tagname="div">{run.user}</Text>
                      <Text type="body-small-medium" tagname="div" className="run-time">
                        {formatTimestamp(run.timestamp)}
                      </Text>
                    </div>
                    <div className={`run-status-dot ${getStatusColor(run.status)}`} title={run.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailsPage;

