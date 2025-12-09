import React, { useState, useEffect } from 'react';
import { Avatar, Text, Button, Icon } from '@momentum-design/components/react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockAgentDatabase } from '../data/mockAgentDetails';
import type { AgentDetails } from '../types/agentDetails.types';
import './runagentpage.css';

type MessageType = 'user' | 'system' | 'config';
type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'review' | 'failed';
type InspectorTab = 'Preview' | 'Raw Data' | 'Context';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

interface WorkflowStepState {
  id: string;
  title: string;
  description: string;
  status: WorkflowStepStatus;
  icon: string;
  logs?: string[];
  currentLogIndex?: number;
  duration?: string;
}

interface CallingSettingRow {
  setting: string;
  currentValue: string;
  newValue: string;
  isChanged: boolean;
  isDangerous?: boolean;
}

const RunAgentPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  
  // Fetch agent from database
  const agent: AgentDetails = agentId 
    ? (mockAgentDatabase.find(a => a.id === agentId) || mockAgentDatabase[0])
    : mockAgentDatabase[0];

  // State Management
  const [mode, setMode] = useState<'form' | 'chat'>('form');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<InspectorTab>('Preview');
  
  // Form State
  const [sourceUser, setSourceUser] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [transferSettings, setTransferSettings] = useState(true);
  
  // Workflow State
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepState[]>([
    { 
      id: 'step1', 
      title: 'Fetch Profiles', 
      description: 'Retrieve call recording', 
      status: 'pending', 
      icon: 'contact-card-regular',
      logs: ['Connecting to User API...', 'Authenticating...', 'Retrieving UUID...', 'Fetching profile data...', 'Done.'],
      currentLogIndex: 0
    },
    { 
      id: 'step2', 
      title: 'Analyze Settings', 
      description: 'Analyze settings for conflicts', 
      status: 'pending', 
      icon: 'analysis-regular',
      logs: ['Loading rules engine...', 'Scanning 12 rules...', 'Detecting conflicts...', 'Mapping extensions...', 'Verifying permissions...', 'Done.'],
      currentLogIndex: 0
    },
    { 
      id: 'step3', 
      title: 'Review Changes', 
      description: 'Human verification required', 
      status: 'pending', 
      icon: 'handset-regular' 
    },
    { 
      id: 'step4', 
      title: 'Apply Transfer', 
      description: 'Update system configuration', 
      status: 'pending', 
      icon: 'check-circle-regular',
      logs: ['Initiating transfer...', 'Backing up current config...', 'Applying new settings...', 'Verifying application...', 'Done.'],
      currentLogIndex: 0
    },
  ]);

  // Log cycling effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeStepIndex >= 0 && activeStepIndex < workflowSteps.length) {
      const currentStep = workflowSteps[activeStepIndex];
      if (currentStep.status === 'running' && currentStep.logs && currentStep.logs.length > 0) {
        interval = setInterval(() => {
          setWorkflowSteps(prev => prev.map((step, idx) => {
            if (idx === activeStepIndex && step.logs) {
              const nextIndex = (step.currentLogIndex || 0) + 1;
              return {
                ...step,
                currentLogIndex: nextIndex % step.logs.length
              };
            }
            return step;
          }));
        }, 800);
      }
    }
    
    return () => clearInterval(interval);
  }, [activeStepIndex, workflowSteps[activeStepIndex]?.status]);

  // Mock Calling Settings Diff Data
  const callingSettingsDiff: CallingSettingRow[] = [
    { setting: 'Extension', currentValue: 'None', newValue: '1024', isChanged: true },
    { setting: 'Call Forwarding', currentValue: 'Active', newValue: 'Voicemail', isChanged: true },
    { setting: 'Voicemail PIN', currentValue: '****', newValue: 'Reset', isChanged: true, isDangerous: true },
    { setting: 'Privacy Setting', currentValue: 'Default', newValue: 'Default', isChanged: false },
    { setting: 'Call Waiting', currentValue: 'Enabled', newValue: 'Enabled', isChanged: false },
    { setting: 'Do Not Disturb', currentValue: 'Off', newValue: 'Business Hours', isChanged: true },
  ];

  const handleStartTransfer = () => {
    if (!sourceUser || !targetUser) {
      alert('Please select both Source and Target users');
      return;
    }

    // Add config summary to messages
    const configMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: `Transfer settings from ${sourceUser} to ${targetUser}`,
      timestamp: new Date(),
    };
    setMessages([configMessage]);
    
    // Switch to chat mode
    setMode('chat');
    setActiveStepIndex(0);
    
    // Simulate workflow execution
    setTimeout(() => {
      // Step 1: Fetch Profiles
      const systemMsg1: Message = {
        id: `msg-${Date.now()}-1`,
        type: 'system',
        content: 'Analyzing profiles...',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMsg1]);
      
      setWorkflowSteps(prev => prev.map((step, idx) => 
        idx === 0 ? { ...step, status: 'running' } : step
      ));
      
      setTimeout(() => {
        setWorkflowSteps(prev => prev.map((step, idx) => 
          idx === 0 ? { ...step, status: 'completed', duration: '340ms' } : 
          idx === 1 ? { ...step, status: 'running' } : step
        ));
        setActiveStepIndex(1);
        
        setTimeout(() => {
          setWorkflowSteps(prev => prev.map((step, idx) => 
            idx === 1 ? { ...step, status: 'completed', duration: '1.2s' } : 
            idx === 2 ? { ...step, status: 'review' } : step
          ));
          setActiveStepIndex(2);
          
          const systemMsg2: Message = {
            id: `msg-${Date.now()}-2`,
            type: 'system',
            content: 'Analysis complete. Please review changes in the Inspector panel.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, systemMsg2]);
        }, 4000); // Increased time to show logs
      }, 3000); // Increased time to show logs
    }, 500);
  };

  const handleApproveTransfer = () => {
    setWorkflowSteps(prev => prev.map((step, idx) => 
      idx === 2 ? { ...step, status: 'completed', duration: '5.4s' } : 
      idx === 3 ? { ...step, status: 'running' } : step
    ));
    setActiveStepIndex(3);
    
    const systemMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'system',
      content: 'Applying transfer...',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMsg]);
    
    setTimeout(() => {
      setWorkflowSteps(prev => prev.map((step, idx) => 
        idx === 3 ? { ...step, status: 'completed', duration: '820ms' } : step
      ));
      
      const completeMsg: Message = {
        id: `msg-${Date.now()}-complete`,
        type: 'system',
        content: '✓ Transfer completed successfully! All settings have been applied.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, completeMsg]);
    }, 4000);
  };

  const handleCancelTransfer = () => {
    const cancelMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'system',
      content: 'Transfer cancelled by user.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, cancelMsg]);
    
    setWorkflowSteps(prev => prev.map(step => 
      step.status === 'review' ? { ...step, status: 'pending' } : step
    ));
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'system',
        content: `I can help with that. The old extension (1024) will be preserved and reassigned to the target user.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  const handleReset = () => {
    // Reset all state to initial values
    setMode('form');
    setMessages([]);
    setInputValue('');
    setActiveTab('Preview');
    setSourceUser('');
    setTargetUser('');
    setTransferSettings(true);
    setActiveStepIndex(-1);
    setWorkflowSteps([
      { 
        id: 'step1', 
        title: 'Fetch Profiles', 
        description: 'Retrieve call recording', 
        status: 'pending', 
        icon: 'contact-card-regular',
        logs: ['Connecting to User API...', 'Authenticating...', 'Retrieving UUID...', 'Fetching profile data...', 'Done.'],
        currentLogIndex: 0
      },
      { 
        id: 'step2', 
        title: 'Analyze Settings', 
        description: 'Analyze settings for conflicts', 
        status: 'pending', 
        icon: 'analysis-regular',
        logs: ['Loading rules engine...', 'Scanning 12 rules...', 'Detecting conflicts...', 'Mapping extensions...', 'Verifying permissions...', 'Done.'],
        currentLogIndex: 0
      },
      { 
        id: 'step3', 
        title: 'Review Changes', 
        description: 'Human verification required', 
        status: 'pending', 
        icon: 'handset-regular' 
      },
      { 
        id: 'step4', 
        title: 'Apply Transfer', 
        description: 'Update system configuration', 
        status: 'pending', 
        icon: 'check-circle-regular',
        logs: ['Initiating transfer...', 'Backing up current config...', 'Applying new settings...', 'Verifying application...', 'Done.'],
        currentLogIndex: 0
      },
    ]);
  };

  const getStepStatusIcon = (status: WorkflowStepStatus) => {
    switch (status) {
      case 'completed':
        return 'check-circle-filled';
      case 'running':
        return 'spinner-partial-filled';
      case 'review':
        return 'priority-circle-filled';
      case 'failed':
        return 'error-filled';
      default:
        return 'circle-regular';
    }
  };

  const getStepStatusClass = (status: WorkflowStepStatus) => {
    return `step-status-${status}`;
  };

  const isReviewPending = workflowSteps.some(step => step.status === 'review');
  const isWorkflowComplete = workflowSteps.every(step => 
    step.status === 'completed' || step.status === 'pending'
  ) && workflowSteps.some(step => step.status === 'completed');

  return (
    <div className="run-agent-wrapper">
      {/* Header Section */}
      <div className="run-agent-header">
        <div className="run-agent-breadcrumbs">
          <Text 
            type="body-small-medium" 
            tagname="span" 
            className="breadcrumb-item"
            onClick={() => navigate('/ai-agent')}
          >
            AI Agents
          </Text>
          <Icon name="arrow-right-regular" size={16} />
          <Text 
            type="body-small-medium" 
            tagname="span" 
            className="breadcrumb-item"
            onClick={() => navigate(`/ai-agent/${agent.id}`)}
          >
            {agent.name}
          </Text>
          <Icon name="arrow-right-regular" size={16} />
          <Text type="body-small-medium" tagname="span" className="breadcrumb-current">Run agent</Text>
        </div>
        
        <div className="run-agent-title-row">
          <div className="run-agent-title-left">
            <Text type="heading-large-bold" tagname="h1">Run: {agent.name}</Text>
          </div>
          <div className="run-agent-actions">
            <Button variant="tertiary" prefixIcon="stop-circle-regular">
              Stop
            </Button>
            <Button 
              variant="secondary" 
              prefixIcon="refresh-regular"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="run-agent-grid">
        {/* LEFT COLUMN: Agent Control Panel */}
        <div className="run-agent-column-left">
          <div className="control-panel-card">
            <div className="control-panel-header">
              <Text type="heading-small-bold" tagname="h3">Control Panel</Text>
            </div>
            
            {/* Configuration Section - Can be disabled */}
            {mode === 'form' && (
              <div className="config-section">
                <fieldset disabled={isReviewPending} className="config-form">
                  <Text type="body-large-bold" tagname="div" className="form-title">
                    Transfer Configuration
                  </Text>
                  
                  <div className="form-field">
                    <Text type="body-midsize-bold" tagname="div">
                      Source User *
                    </Text>
                    <select 
                      className="form-select"
                      value={sourceUser}
                      onChange={(e) => setSourceUser(e.target.value)}
                    >
                      <option value="">Select user...</option>
                      <option value="John Doe (john@co.com)">John Doe (john@co.com)</option>
                      <option value="Sarah Smith (sarah@co.com)">Sarah Smith (sarah@co.com)</option>
                    </select>
                  </div>
                  
                  <div className="form-field">
                    <Text type="body-midsize-bold" tagname="div">
                      Target User *
                    </Text>
                    <select 
                      className="form-select"
                      value={targetUser}
                      onChange={(e) => setTargetUser(e.target.value)}
                    >
                      <option value="">Select user...</option>
                      <option value="Sasha Newhire (sasha@co.com)">Sasha Newhire (sasha@co.com)</option>
                      <option value="Alex Johnson (alex@co.com)">Alex Johnson (alex@co.com)</option>
                    </select>
                  </div>
                  
                  <div className="form-field-toggle">
                    <div className="toggle-label-group">
                      <Text type="body-midsize-bold" tagname="div">
                        Transfer Settings
                      </Text>
                      <Text type="body-small-medium" tagname="span" className="toggle-description">
                        Copy all calling settings to target user
                      </Text>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={transferSettings}
                        onChange={(e) => setTransferSettings(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </fieldset>
              </div>
            )}
            
            {/* Message Feed - Chat Mode */}
            {mode === 'chat' && (
              <div className="message-feed">
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-message chat-message-${msg.type}`}>
                    {msg.type === 'user' && (
                      <Avatar size={32} initials="YW" title="You" />
                    )}
                    {msg.type === 'system' && (
                      <div className="system-icon">
                        <Icon name="bot-regular" size={20} />
                      </div>
                    )}
                    <div className="message-content">
                      <Text type="body-midsize-medium" tagname="p">
                        {msg.content}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* PRIMARY ACTIONS SECTION - ALWAYS ENABLED, NEVER DISABLED */}
            <div className="primary-actions-section">
              {/* Start Transfer Button - Only in form mode when NOT pending */}
              {mode === 'form' && !isReviewPending && (
                <Button 
                  variant="primary"
                  onClick={handleStartTransfer}
                  disabled={!sourceUser || !targetUser}
                >
                  Start Transfer
                </Button>
              )}
              
              {/* Approval Required - Show when review is pending */}
              {isReviewPending && (
                <div className="approval-container">
                  <div className="approval-banner">
                    <Icon name="warning-regular" size={20} />
                    <Text type="body-midsize-bold" tagname="span">Approval Required</Text>
                  </div>
                  <Text type="body-small-medium" tagname="p" className="approval-hint">
                    Review changes in the Inspector panel →
                  </Text>
                  <div className="approval-actions">
                    <Button 
                      variant="primary" 
                      prefixIcon="check-regular"
                      onClick={handleApproveTransfer}
                    >
                      Approve & Apply
                    </Button>
                    <Button 
                      variant="secondary" 
                      prefixIcon="cancel-regular"
                      onClick={handleCancelTransfer}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input Area - Only in chat mode */}
            {mode === 'chat' && (
              <div className="input-area">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="chat-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  variant="primary" 
                  size={32}
                  prefixIcon="send-filled"
                  aria-label="Send message"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                />
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Workflow Visualizer */}
        <div className="run-agent-column-center">
          <div className="workflow-visualizer-card">
            <div className="workflow-visualizer-header">
              <Text type="heading-small-bold" tagname="h3">Workflow Pipeline</Text>
            </div>
            
            <div className="workflow-steps-container">
              {mode === 'form' && (
                <div className="system-standby-indicator">
                  <div className="status-dot"></div>
                  <Text type="body-small-bold" tagname="span">System Standby</Text>
                </div>
              )}
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="workflow-step-item">
                  <div className="workflow-step-track">
                    <div className={`workflow-step-icon ${getStepStatusClass(step.status)}`}>
                      <Icon 
                        name={getStepStatusIcon(step.status) as any} 
                        size={24} 
                        className={step.status === 'running' ? 'spinning-icon' : ''}
                      />
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className={`workflow-step-connector ${index < activeStepIndex ? 'connector-completed' : index === activeStepIndex ? 'connector-active' : ''}`} />
                    )}
                  </div>
                  
                  <div className="workflow-step-details">
                    <div className="workflow-step-title-row">
                      <div className="workflow-step-text">
                        <div className="step-title-wrapper">
                          <Text type="body-large-bold" tagname="div">
                            {step.title}
                          </Text>
                          {step.status === 'completed' && step.duration && (
                            <span className="step-duration-badge">[{step.duration}]</span>
                          )}
                        </div>
                        <Text type="body-small-medium" tagname="div" className="step-description">
                          {step.description}
                        </Text>
                        {step.status === 'running' && step.logs && (
                          <div className="step-log-container">
                            <Text type="body-small-medium" tagname="div" className="step-log">
                              {step.logs[step.currentLogIndex || 0]}
                            </Text>
                          </div>
                        )}
                      </div>
                      {step.status === 'review' && (
                        <span className="review-badge">Human Approval Required</span>
                      )}
                      {step.status === 'completed' && (
                        <span className="completed-badge">✓</span>
                      )}
                      {step.status === 'running' && (
                        <span className="running-badge">Running...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Inspector Panel */}
        <div className="run-agent-column-right">
          <div className="inspector-panel-card">
            <div className="inspector-header">
              <Text type="heading-small-bold" tagname="h3">Inspector</Text>
            </div>
            
            {/* Tabs */}
            <div className="inspector-tabs">
              {(['Preview', 'Raw Data', 'Context'] as InspectorTab[]).map(tab => (
                <button
                  key={tab}
                  className={`inspector-tab ${activeTab === tab ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <Text type="body-midsize-medium" tagname="span">{tab}</Text>
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="inspector-body">
              {activeTab === 'Preview' && (
                <>
                  {activeStepIndex < 2 && (
                    <div className="inspector-placeholder">
                      <div className="placeholder-icon-wrapper">
                        <img src="/call-voicemail-192.svg" alt="Waiting" className="placeholder-svg-icon" />
                      </div>
                      <Text type="body-large-medium" tagname="p">
                        Waiting to start...
                      </Text>
                      <Text type="body-small-medium" tagname="p" className="placeholder-hint">
                        Configure the transfer and click "Start" to begin
                      </Text>
                    </div>
                  )}
                  
                  {activeStepIndex >= 2 && (
                    <div className="calling-settings-diff">
                      {isWorkflowComplete && (
                        <div className="success-banner">
                          <Icon name="check-circle-filled" size={20} className="success-icon" />
                          <Text type="body-midsize-bold" tagname="span">Transfer Complete</Text>
                        </div>
                      )}
                      <div className="diff-header">
                        <Icon name="handset-regular" size={20} />
                        <Text type="body-large-bold" tagname="h4">
                          Calling Settings Transfer
                        </Text>
                      </div>
                      
                      <div className="diff-table">
                        <div className="diff-table-header">
                          <div className="diff-col-setting">
                            <Text type="body-small-bold" tagname="span">Setting</Text>
                          </div>
                          <div className="diff-col-current">
                            <Text type="body-small-bold" tagname="span">Current (Target)</Text>
                          </div>
                          <div className="diff-col-new">
                            <Text type="body-small-bold" tagname="span">New (Source)</Text>
                          </div>
                        </div>
                        
                        <div className="diff-table-body">
                          {callingSettingsDiff.map((row, idx) => (
                            <div key={idx} className={`diff-row ${row.isChanged ? 'diff-row-changed' : ''}`}>
                              <div className="diff-col-setting">
                                <Text type="body-midsize-medium" tagname="span">
                                  {row.setting}
                                </Text>
                              </div>
                              <div className="diff-col-current">
                                <Text type="body-midsize-medium" tagname="span">
                                  {row.currentValue}
                                </Text>
                              </div>
                              <div className={`diff-col-new ${row.isChanged ? (row.isDangerous ? 'diff-value-danger' : 'diff-value-changed') : ''}`}>
                                <Text type="body-midsize-medium" tagname="span">
                                  {row.newValue}
                                </Text>
                                {row.isChanged && (
                                  <Icon name="arrow-left-regular" size={14} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'Raw Data' && (
                <div className="raw-data-view">
                  <pre className="json-preview">
{JSON.stringify({
  sourceUser,
  targetUser,
  transferSettings,
  workflowStatus: workflowSteps.map(s => ({ title: s.title, status: s.status }))
}, null, 2)}
                  </pre>
                </div>
              )}
              
              {activeTab === 'Context' && (
                <div className="context-view">
                  <Text type="body-midsize-medium" tagname="p">
                    Agent: {agent.name}
                  </Text>
                  <Text type="body-small-medium" tagname="p" className="context-detail">
                    This agent transfers calling settings between users while maintaining security protocols.
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunAgentPage;

