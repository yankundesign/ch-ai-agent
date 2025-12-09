import React, { useState, useEffect } from 'react';
import { Avatar, Text, Button, Icon, Chip, Accordion } from '@momentum-design/components/react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockAgentDatabase } from '../data/mockAgentDetails';
import type { AgentDetails, WorkflowStep, AgentInput, Guardrail, RunHistory, AdvancedSettings } from '../types/agentDetails.types';
import { getGuardrailIcon } from '../utils/iconMapping';
import './agentdetailspage.css';
import './runagentpage.css';
import './agentworkspacepage.css';

// --- Types ---
type ViewMode = 'overview' | 'execution';
type AgentState = 'idle' | 'running' | 'review' | 'done';

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
  knowledgeDocs?: string[];
}

interface CallingSettingRow {
  setting: string;
  currentValue: string;
  newValue: string;
  isChanged: boolean;
  isDangerous?: boolean;
}

interface RunSummary {
  sourceUserName: string;
  targetUserName: string;
  settingsUpdated: number;
  guardrailBlocks: number;
  durationSeconds: number;
  status: 'success' | 'partial' | 'failed';
}

const AgentWorkspacePage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  // --- Data Loading ---
  const agent: AgentDetails = agentId
    ? (mockAgentDatabase.find(a => a.id === agentId) || mockAgentDatabase[0])
    : mockAgentDatabase[0];

  // --- State Management ---
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [agentState, setAgentState] = useState<AgentState>('idle');

  // Form State
  const [sourceUser, setSourceUser] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    numbersIdentity: true,
    voicemailGreetings: true,
    callHandlingRules: true,
    betweenUserPermissions: false,
    userExperienceIntegrations: true,
    recordingAgentSettings: false,
  });

  // Execution State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<InspectorTab>('Preview');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  
  const [executionSteps, setExecutionSteps] = useState<WorkflowStepState[]>([
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

  const callingSettingsDiff: CallingSettingRow[] = [
    { setting: 'Extension', currentValue: 'None', newValue: '1024', isChanged: true },
    { setting: 'Call Forwarding', currentValue: 'Active', newValue: 'Voicemail', isChanged: true },
    { setting: 'Voicemail PIN', currentValue: '****', newValue: 'Reset', isChanged: true, isDangerous: true },
    { setting: 'Privacy Setting', currentValue: 'Default', newValue: 'Default', isChanged: false },
    { setting: 'Call Waiting', currentValue: 'Enabled', newValue: 'Enabled', isChanged: false },
    { setting: 'Do Not Disturb', currentValue: 'Off', newValue: 'Business Hours', isChanged: true },
  ];

  // --- Effects ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeStepIndex >= 0 && activeStepIndex < executionSteps.length) {
      const currentStep = executionSteps[activeStepIndex];
      if (currentStep.status === 'running' && currentStep.logs && currentStep.logs.length > 0) {
        interval = setInterval(() => {
          setExecutionSteps(prev => prev.map((step, idx) => {
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
  }, [activeStepIndex, executionSteps[activeStepIndex]?.status]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-dropdown-wrapper')) {
        setSourceDropdownOpen(false);
        setTargetDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleAdvancedSettingChange = (key: keyof AdvancedSettings, value: boolean) => {
    setAdvancedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleStartRun = () => {
    if (!sourceUser || !targetUser) {
      alert('Please select both Source and Target users');
      return;
    }

    setViewMode('execution');
    setAgentState('running');
    setActiveStepIndex(0);

    const configMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: `Transfer settings from ${sourceUser} to ${targetUser}`,
      timestamp: new Date(),
    };
    setMessages([configMessage]);

    setTimeout(() => {
      const systemMsg1: Message = {
        id: `msg-${Date.now()}-1`,
        type: 'system',
        content: 'Analyzing profiles...',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMsg1]);
      
      setExecutionSteps(prev => prev.map((step, idx) => 
        idx === 0 ? { ...step, status: 'running' } : step
      ));
      
      setTimeout(() => {
        setExecutionSteps(prev => prev.map((step, idx) => 
          idx === 0 ? { ...step, status: 'completed', duration: '340ms' } : 
          idx === 1 ? { ...step, status: 'running' } : step
        ));
        setActiveStepIndex(1);
        
        setTimeout(() => {
          setExecutionSteps(prev => prev.map((step, idx) => 
            idx === 1 ? { ...step, status: 'completed', duration: '1.2s' } : 
            idx === 2 ? { ...step, status: 'review' } : step
          ));
          setActiveStepIndex(2);
          setAgentState('review');
          
          const systemMsg2: Message = {
            id: `msg-${Date.now()}-2`,
            type: 'system',
            content: 'Analysis complete. Please review changes in the Inspector panel.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, systemMsg2]);
        }, 4000); 
      }, 3000); 
    }, 500);
  };

  const handleStopRun = () => {
    setAgentState('idle');
    const cancelMsg: Message = {
        id: `msg-${Date.now()}`,
        type: 'system',
        content: 'Run stopped by user.',
        timestamp: new Date(),
    };
    setMessages(prev => [...prev, cancelMsg]);
    setExecutionSteps(prev => prev.map(step => 
        step.status === 'running' ? { ...step, status: 'failed' } : step
    ));
  };

  const handleApprove = () => {
    setExecutionSteps(prev => prev.map((step, idx) => 
      idx === 2 ? { ...step, status: 'completed', duration: '5.4s' } : 
      idx === 3 ? { ...step, status: 'running' } : step
    ));
    setActiveStepIndex(3);
    setAgentState('running');
    
    const systemMsg: Message = {
      id: `msg-${Date.now()}`,
      type: 'system',
      content: 'Applying transfer...',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMsg]);
    
    setTimeout(() => {
      setExecutionSteps(prev => prev.map((step, idx) => 
        idx === 3 ? { ...step, status: 'completed', duration: '820ms' } : step
      ));
      setAgentState('done');
      
      // Populate run summary
      setRunSummary({
        sourceUserName: sourceUser.split(' (')[0],
        targetUserName: targetUser.split(' (')[0],
        settingsUpdated: callingSettingsDiff.filter(r => r.isChanged).length,
        guardrailBlocks: 0,
        durationSeconds: 28,
        status: 'success'
      });
      
      const completeMsg: Message = {
        id: `msg-${Date.now()}-complete`,
        type: 'system',
        content: '✓ Transfer completed successfully! All settings have been applied.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, completeMsg]);
    }, 4000);
  };

  const handleReject = () => {
    setAgentState('idle');
    const cancelMsg: Message = {
        id: `msg-${Date.now()}`,
        type: 'system',
        content: 'Transfer rejected by user.',
        timestamp: new Date(),
    };
    setMessages(prev => [...prev, cancelMsg]);
    setExecutionSteps(prev => prev.map(step => 
        step.status === 'review' ? { ...step, status: 'failed' } : step
    ));
  };

  const handleDone = () => {
    setViewMode('overview');
    setAgentState('idle');
    setExecutionSteps([
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
    setActiveStepIndex(-1);
    setMessages([]);
    setSourceUser('');
    setTargetUser('');
    setAdvancedSettings({
      numbersIdentity: true,
      voicemailGreetings: true,
      callHandlingRules: true,
      betweenUserPermissions: false,
      userExperienceIntegrations: true,
      recordingAgentSettings: false,
    });
    setRunSummary(null);
  };

  const handleSelectRun = (run: RunHistory) => {
    console.log('Select run', run.id);
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
  };

  const getStepStatusIcon = (status: WorkflowStepStatus) => {
    switch (status) {
      case 'completed': return 'check-circle-filled';
      case 'running': return 'spinner-partial-filled';
      case 'review': return 'priority-circle-filled';
      case 'failed': return 'error-filled';
      default: return 'circle-regular';
    }
  };

  const getStepStatusClass = (status: WorkflowStepStatus) => `step-status-${status}`;

  // --- Render Sections ---

  const renderActionDock = () => {
    return (
      <div className="agent-details-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Text type="heading-small-bold" tagname="h3" className="card-title">Control Panel</Text>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            {/* CONFIGURATION FORM - Can be disabled */}
            <div className="config-form" style={{ 
              opacity: agentState !== 'idle' ? 0.5 : 1, 
              pointerEvents: agentState !== 'idle' ? 'none' : 'auto' 
            }}>
                <Text type="body-large-bold" tagname="div" className="form-title">
                  Transfer Configuration
                </Text>
                
                <div className="form-field">
                  <Text type="body-midsize-bold" tagname="div">Source User *</Text>
                  <div className="custom-dropdown-wrapper">
                    <div
                      className="form-select custom-dropdown-trigger"
                      onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                    >
                      {sourceUser || 'Select user...'}
                    </div>
                    {sourceDropdownOpen && (
                      <div className="dropdown-menu">
                        <div
                          className={`dropdown-item ${sourceUser === 'John Doe (john@co.com)' ? 'selected' : ''}`}
                          onClick={() => {
                            setSourceUser('John Doe (john@co.com)');
                            setSourceDropdownOpen(false);
                          }}
                        >
                          <Text type="body-midsize-medium" tagname="span">John Doe (john@co.com)</Text>
                          {sourceUser === 'John Doe (john@co.com)' && <Icon name="check-regular" size={16} />}
                        </div>
                        <div
                          className={`dropdown-item ${sourceUser === 'Sarah Smith (sarah@co.com)' ? 'selected' : ''}`}
                          onClick={() => {
                            setSourceUser('Sarah Smith (sarah@co.com)');
                            setSourceDropdownOpen(false);
                          }}
                        >
                          <Text type="body-midsize-medium" tagname="span">Sarah Smith (sarah@co.com)</Text>
                          {sourceUser === 'Sarah Smith (sarah@co.com)' && <Icon name="check-regular" size={16} />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-field">
                  <Text type="body-midsize-bold" tagname="div">Target User *</Text>
                  <div className="custom-dropdown-wrapper">
                    <div
                      className="form-select custom-dropdown-trigger"
                      onClick={() => setTargetDropdownOpen(!targetDropdownOpen)}
                    >
                      {targetUser || 'Select user...'}
                    </div>
                    {targetDropdownOpen && (
                      <div className="dropdown-menu">
                        <div
                          className={`dropdown-item ${targetUser === 'Sasha Newhire (sasha@co.com)' ? 'selected' : ''}`}
                          onClick={() => {
                            setTargetUser('Sasha Newhire (sasha@co.com)');
                            setTargetDropdownOpen(false);
                          }}
                        >
                          <Text type="body-midsize-medium" tagname="span">Sasha Newhire (sasha@co.com)</Text>
                          {targetUser === 'Sasha Newhire (sasha@co.com)' && <Icon name="check-regular" size={16} />}
                        </div>
                        <div
                          className={`dropdown-item ${targetUser === 'Alex Johnson (alex@co.com)' ? 'selected' : ''}`}
                          onClick={() => {
                            setTargetUser('Alex Johnson (alex@co.com)');
                            setTargetDropdownOpen(false);
                          }}
                        >
                          <Text type="body-midsize-medium" tagname="span">Alex Johnson (alex@co.com)</Text>
                          {targetUser === 'Alex Johnson (alex@co.com)' && <Icon name="check-regular" size={16} />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Run summary text - shown when complete */}
                {agentState === 'done' && runSummary && (
                  <Text type="body-small-medium" tagname="p" className="run-summary-text">
                    Transferred calling settings from {runSummary.sourceUserName} to {runSummary.targetUserName}.
                  </Text>
                )}
                
                <Accordion headerText="Advanced options" expanded={false} size="small">
                  <div className="advanced-settings-list">
                    {/* Numbers & identity */}
                    <div className="form-field-toggle">
                      <div className="toggle-label-group">
                        <Text type="body-midsize-bold" tagname="div">Numbers & identity</Text>
                        <Text type="body-small-medium" tagname="span" className="toggle-description">
                          Directory numbers, extensions, caller ID, and emergency callback number.
                        </Text>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={advancedSettings.numbersIdentity}
                          onChange={(e) => handleAdvancedSettingChange('numbersIdentity', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    {/* Voicemail & greetings */}
                    <div className="form-field-toggle">
                      <div className="toggle-label-group">
                        <Text type="body-midsize-bold" tagname="div">Voicemail & greetings</Text>
                        <Text type="body-small-medium" tagname="span" className="toggle-description">
                          Voicemail enablement, language, timezone, and personal greetings.
                        </Text>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={advancedSettings.voicemailGreetings}
                          onChange={(e) => handleAdvancedSettingChange('voicemailGreetings', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    {/* Call handling rules */}
                    <div className="form-field-toggle">
                      <div className="toggle-label-group">
                        <Text type="body-midsize-bold" tagname="div">Call handling rules</Text>
                        <Text type="body-small-medium" tagname="span" className="toggle-description">
                          Forwarding, anonymous call rejection, call waiting, and schedules.
                        </Text>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={advancedSettings.callHandlingRules}
                          onChange={(e) => handleAdvancedSettingChange('callHandlingRules', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    {/* Between-user permissions */}
                    <div className="form-field-toggle">
                      <div className="toggle-label-group">
                        <Text type="body-midsize-bold" tagname="div">Between-user permissions</Text>
                        <Text type="body-small-medium" tagname="span" className="toggle-description">
                          Monitoring, barge-in, push-to-talk, and executive assistant relationships.
                        </Text>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={advancedSettings.betweenUserPermissions}
                          onChange={(e) => handleAdvancedSettingChange('betweenUserPermissions', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>


                    {/* Recording & agent settings */}
                    <div className="form-field-toggle">
                      <div className="toggle-label-group">
                        <Text type="body-midsize-bold" tagname="div">Recording & agent settings</Text>
                        <Text type="body-small-medium" tagname="span" className="toggle-description">
                          Call recording configuration, receptionist client, and agent caller ID.
                        </Text>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={advancedSettings.recordingAgentSettings}
                          onChange={(e) => handleAdvancedSettingChange('recordingAgentSettings', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </Accordion>
            </div>

            {/* PRIMARY ACTIONS SECTION - ALWAYS ENABLED, OUTSIDE config-form */}
            <div className="primary-actions-section">
              {/* Approval Required */}
              {agentState === 'review' && (
                <div className="approval-container">
                  <div className="approval-banner">
                    <Icon name="warning-filled" size={16} />
                    <Text type="body-midsize-bold" tagname="span">Approval Required</Text>
                  </div>
                  <Text type="body-small-medium" tagname="p" className="approval-hint">
                    Review changes in the Inspector panel &rarr;
                  </Text>
                  <div className="approval-actions">
                    <Button variant="primary" onClick={handleApprove}>Approve & Apply</Button>
                    <Button variant="secondary" onClick={handleReject}>Reject</Button>
                  </div>
                </div>
              )}

              {/* Run Agent Button */}
              {agentState === 'idle' && (
                <>
                  <p className="helper-text">
                    Select both users above to run the agent
                  </p>
                  <Button 
                    variant="primary" 
                    prefixIcon="play-circle-regular" 
                    onClick={handleStartRun}
                    disabled={!sourceUser || !targetUser}
                  >
                    Run Agent
                  </Button>
                </>
              )}
              
              {/* Stop Run Button */}
              {agentState === 'running' && (
                <Button 
                  variant="secondary" 
                  prefixIcon="stop-circle-regular" 
                  onClick={handleStopRun}
                >
                  Stop Run
                </Button>
              )}

              {/* Completion Actions - Three next-step buttons */}
              {agentState === 'done' && (
                <div className="completion-actions">
                  <Button 
                    variant="primary" 
                    prefixIcon="handset-regular"
                    onClick={() => console.log('Review settings')}
                  >
                    Review settings
                  </Button>
                  <Button 
                    variant="secondary" 
                    prefixIcon="refresh-regular"
                    onClick={() => {
                      handleDone();
                      console.log('Run another transfer');
                    }}
                  >
                    Run another transfer
                  </Button>
                  <Button 
                    variant="secondary"
                    prefixIcon="arrow-left-regular"
                    onClick={() => console.log('Back to agent overview')}
                  >
                    Back to agent overview
                  </Button>
                </div>
              )}
            </div>
        </div>
      </div>
    );
  };

  const renderAdaptiveCanvas = () => {
    if (viewMode === 'overview') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }} className="no-scrollbar">
                {/* Row 1: Overview + Workflow */}
                <div className="agent-overview-workflow-row">
                    {/* Agent Overview */}
                    <div className="agent-overview-card">
                        <div className="overview-header">
                            <Text type="heading-small-bold" tagname="h3" className="overview-title">Agent Overview</Text>
                        </div>
                        
                        <div className="overview-content">
                            <div className="overview-badges-container">
                                <span className="badge-category">{agent.category}</span>
                                {agent.complexity && <span className="badge-complexity">{agent.complexity}</span>}
                            </div>
                            
                            <div className="overview-description">
                                <Text type="body-midsize-medium" tagname="p">{agent.description}</Text>
                            </div>
                            
                            {agent.expectedOutcome && (
                                <div className="overview-outcome-box">
                                    <Text type="body-small-bold" tagname="div" className="outcome-label">EXPECTED OUTCOME</Text>
                                    <Text type="body-midsize-medium" tagname="p" className="outcome-text">{agent.expectedOutcome}</Text>
                                </div>
                            )}

                            {agent.whenToUse && (
                                <div className="overview-usage-box">
                                    <Text type="body-small-bold" tagname="div" className="usage-label">WHEN TO USE</Text>
                                    <Text type="body-midsize-medium" tagname="p" className="usage-text">{agent.whenToUse}</Text>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Workflow */}
                    <div className="agent-details-card workflow-card" style={{ minWidth: 0 }}>
                        <Text type="heading-small-bold" tagname="h3" className="card-title">Workflow</Text>
                        <div className="workflow-visualization">
                            {agent.workflow.map((step: WorkflowStep, index: number) => (
                              <div 
                                key={step.id} 
                                className="workflow-step-timeline"
                                onClick={() => console.log('Click step', step.id)}
                                style={{ cursor: 'pointer' }}
                                title="Click to view step details"
                              >
                                <div className="timeline-track">
                                  <div className="step-icon-circle" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <Icon name={step.icon as any} size={20} />
                                  </div>
                                  {index < agent.workflow.length - 1 && <div className="timeline-connector" />}
                                </div>
                                <div className="step-content">
                                  <Text type="body-large-bold" tagname="div">{step.title}</Text>
                                  <Text type="body-small-medium" tagname="p" className="step-description">{step.description}</Text>
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Metrics (Full Width) - Trust-building monitoring panel */}
                <div className="agent-metrics-card">
                    {/* Card Header */}
                    <div className="metrics-header">
                        <Text type="heading-small-bold" tagname="h3" className="metrics-title">Metrics</Text>
                        <div className="metrics-time-badge">
                            <Text type="body-small-medium" tagname="span">Last 30 days</Text>
                        </div>
                    </div>

                    {/* Top Band - Health Summary (Hero Numbers) */}
                    <div className="metrics-health-summary">
                        <div className="metric-hero-tile">
                            <div className="metric-hero-icon">
                                <Icon name="check-circle-regular" size={20} />
                            </div>
                            <div className="metric-hero-content">
                                <Text type="body-small-bold" tagname="div" className="metric-hero-label">SUCCESS RATE</Text>
                                <Text type="heading-xlarge-bold" tagname="div" className="metric-hero-value metric-success">{agent.metrics.successRate}%</Text>
                                <Text type="body-small-regular" tagname="div" className="metric-hero-helper">Completed runs without errors</Text>
                            </div>
                        </div>

                        <div className="metric-hero-tile">
                            <div className="metric-hero-icon">
                                <Icon name="play-circle-regular" size={20} />
                            </div>
                            <div className="metric-hero-content">
                                <Text type="body-small-bold" tagname="div" className="metric-hero-label">RUNS (30 DAYS)</Text>
                                <Text type="heading-xlarge-bold" tagname="div" className="metric-hero-value">{agent.metrics.runsLast30Days.toLocaleString()}</Text>
                                <Text type="body-small-regular" tagname="div" className="metric-hero-helper">Triggered by admins in your org</Text>
                            </div>
                        </div>

                        <div className="metric-hero-tile">
                            <div className="metric-hero-icon">
                                <Icon name="people-regular" size={20} />
                            </div>
                            <div className="metric-hero-content">
                                <Text type="body-small-bold" tagname="div" className="metric-hero-label">USERS MIGRATED</Text>
                                <Text type="heading-xlarge-bold" tagname="div" className="metric-hero-value">{agent.metrics.usersMigrated.toLocaleString()}</Text>
                                <Text type="body-small-regular" tagname="div" className="metric-hero-helper">Target users who inherited calling settings</Text>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Band - Safety & Usage Details */}
                    {/* <div className="metrics-safety-details">
                        <div className="metric-detail-tile">
                            <Text type="body-small-bold" tagname="div" className="metric-detail-label">Unique admins</Text>
                            <Text type="heading-small-bold" tagname="div" className="metric-detail-value">{agent.metrics.uniqueAdmins}</Text>
                            <Text type="body-small-regular" tagname="div" className="metric-detail-helper">Admins who ran this agent</Text>
                        </div>

                        <div className="metric-detail-tile">
                            <Text type="body-small-bold" tagname="div" className="metric-detail-label">Guardrail blocks</Text>
                            <Text type="heading-small-bold" tagname="div" className="metric-detail-value">{agent.metrics.guardrailBlocks}</Text>
                            <Text type="body-small-regular" tagname="div" className="metric-detail-helper">Runs stopped before changes were applied</Text>
                        </div>

                        <div className="metric-detail-tile">
                            <Text type="body-small-bold" tagname="div" className="metric-detail-label">Incidents reported</Text>
                            <Text 
                                type="heading-small-bold" 
                                tagname="div" 
                                className={`metric-detail-value ${agent.metrics.incidentsReported === 0 ? 'metric-success' : 'metric-warning'}`}
                            >
                                {agent.metrics.incidentsReported}
                            </Text>
                            <Text type="body-small-regular" tagname="div" className="metric-detail-helper">Escalated incidents related to this agent</Text>
                        </div>
                    </div> */}
                </div>

                {/* Row 3: Guardrails + Run History */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Guardrails */}
                    <div className="agent-details-card">
                        <Text type="heading-small-bold" tagname="h3" className="card-title">Guardrails</Text>
                        <div className="guardrails-list">
                            {agent.guardrails.map((guardrail: Guardrail) => (
                              <div key={guardrail.id} className="guardrail-item">
                                <Icon name={getGuardrailIcon(guardrail.iconType) as any} size={16} />
                                <Text type="body-midsize-medium" tagname="span">{guardrail.label}</Text>
                              </div>
                            ))}
                        </div>
                    </div>

                    {/* Run History */}
                    <div className="agent-details-card">
                        <Text type="heading-small-bold" tagname="h3" className="card-title">Run History</Text>
                        <div className="runs-list">
                            {agent.recentRuns.slice(0, 3).map((run: RunHistory) => (
                              <div 
                                key={run.id} 
                                className="run-item" 
                                style={{ padding: '8px 12px', cursor: 'pointer' }}
                                onClick={() => handleSelectRun(run)}
                                title="Click to view run details"
                              >
                                <Avatar size={24} initials={getInitials(run.user)} title={run.user} />
                                <div className="run-info">
                                  <Text type="body-small-medium" tagname="div">{run.user}</Text>
                                  <Text type="body-small-medium" tagname="div" className="run-time" style={{ fontSize: '10px' }}>
                                    {new Date(run.timestamp).toLocaleDateString()}
                                  </Text>
                                </div>
                                <div className={`run-status-dot status-${run.status}`} title={run.status} />
                              </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 4: Knowledge (Full Width) */}
                {agent.hasKnowledge && agent.knowledgeSources && (
                  <div className="agent-details-card">
                    <Text type="heading-small-bold" tagname="h3" className="card-title">Knowledge</Text>
                    <div className="knowledge-section" style={{ marginTop: '0', borderTop: 'none', paddingTop: '0' }}>
                      <div className="knowledge-attachments">
                        {agent.knowledgeSources.map((source, index) => (
                          <div key={index} className="knowledge-attachment-item">
                            <Icon name="document-regular" size={16} />
                            <Text type="body-midsize-medium" tagname="span">{source}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
        );
    } else {
        // Execution Mode
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '100%' }}>
                {/* Live Workflow */}
                <div className="workflow-visualizer-card" style={{ height: '100%' }}>
                    <div className="workflow-visualizer-header">
                      <Text type="heading-small-bold" tagname="h3">Live Execution</Text>
                    </div>
                    <div className="workflow-steps-container">
                        {executionSteps.map((step, index) => (
                            <div key={step.id} className="workflow-step-item">
                              <div className="workflow-step-track">
                                <div className={`workflow-step-icon ${getStepStatusClass(step.status)}`}>
                                  <Icon 
                                    name={getStepStatusIcon(step.status) as any} 
                                    size={24} 
                                    className={step.status === 'running' ? 'spinning-icon' : ''}
                                  />
                                </div>
                                {index < executionSteps.length - 1 && (
                                  <div className={`workflow-step-connector ${index < activeStepIndex ? 'connector-completed' : index === activeStepIndex ? 'connector-active' : ''}`} />
                                )}
                              </div>
                              
                              <div className="workflow-step-details">
                                <div className="workflow-step-title-row">
                                  <div className="workflow-step-text">
                                    <div className="step-title-wrapper">
                                      <Text type="body-large-bold" tagname="div">{step.title}</Text>
                                      {step.status === 'completed' && step.duration && (
                                        <span className="step-duration-badge">[{step.duration}]</span>
                                      )}
                                    </div>
                                    <Text type="body-small-medium" tagname="div" className="step-description">{step.description}</Text>
                                    {step.status === 'running' && step.logs && (
                                      <div className="step-log-container">
                                        <Text type="body-small-medium" tagname="div" className="step-log">
                                          {step.logs[step.currentLogIndex || 0]}
                                        </Text>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inspector */}
                <div className="inspector-panel-card" style={{ height: '100%' }}>
                    <div className="inspector-header">
                      <Text type="heading-small-bold" tagname="h3">Inspector</Text>
                    </div>
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
                    
                    <div className="inspector-body">
                         {activeTab === 'Preview' && (
                             <>
                                {activeStepIndex < 2 ? (
                                    <div className="inspector-placeholder">
                                      <div className="placeholder-icon-wrapper">
                                        <img src="/call-voicemail-192.svg" alt="Waiting" className="placeholder-svg-icon" />
                                      </div>
                                      <Text type="body-large-medium" tagname="p">Processing...</Text>
                                      <Text type="body-small-medium" tagname="p" className="placeholder-hint">The agent is fetching and analyzing data.</Text>
                                    </div>
                                ) : (
                                    <div className="calling-settings-diff">
                                        {agentState === 'done' && runSummary && (
                                            <div className="inspector-success-banner">
                                              <div className="inspector-success-status">
                                                <Icon name="check-circle-filled" size={20} />
                                                <Text type="body-large-bold" tagname="span">Transfer complete</Text>
                                              </div>
                                              <Text type="body-small-medium" tagname="div" className="inspector-success-details">
                                                {runSummary.settingsUpdated} settings updated · {runSummary.durationSeconds}s
                                              </Text>
                                            </div>
                                        )}
                                        <div className="diff-header">
                                            <Icon name="handset-regular" size={20} />
                                            <Text type="body-large-bold" tagname="h4">Calling Settings Transfer</Text>
                                        </div>
                                        <div className="diff-table">
                                            <div className="diff-table-header">
                                              <div className="diff-col-setting"><Text type="body-small-bold" tagname="span">Setting</Text></div>
                                              <div className="diff-col-current"><Text type="body-small-bold" tagname="span">Current (Target)</Text></div>
                                              <div className="diff-col-new"><Text type="body-small-bold" tagname="span">New (Source)</Text></div>
                                            </div>
                                            <div className="diff-table-body">
                                              {callingSettingsDiff.map((row, idx) => (
                                                <div key={idx} className={`diff-row ${row.isChanged ? 'diff-row-changed' : ''}`}>
                                                  <div className="diff-col-setting"><Text type="body-midsize-medium" tagname="span">{row.setting}</Text></div>
                                                  <div className="diff-col-current"><Text type="body-midsize-medium" tagname="span">{row.currentValue}</Text></div>
                                                  <div className={`diff-col-new ${row.isChanged ? (row.isDangerous ? 'diff-value-danger' : 'diff-value-changed') : ''}`}>
                                                    <Text type="body-midsize-medium" tagname="span">{row.newValue}</Text>
                                                    {row.isChanged && <Icon name="arrow-left-regular" size={14} />}
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
                                {JSON.stringify({ sourceUser, targetUser, advancedSettings, status: agentState }, null, 2)}
                               </pre>
                             </div>
                         )}
                         {activeTab === 'Context' && (
                             <div className="context-view">
                               <Text type="body-midsize-medium" tagname="p">Agent: {agent.name}</Text>
                               <Text type="body-small-medium" tagname="p" className="context-detail">{agent.description}</Text>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="agent-details-wrapper" style={{ flexDirection: 'column', gap: '24px', padding: 'var(--local-padding)' }}>
        <div className="agent-details-header">
            <div className="agent-details-breadcrumbs">
              <Text type="body-small-medium" tagname="span" className="breadcrumb-item" onClick={() => navigate('/ai-agent')}>AI Agents</Text>
              <Icon name="arrow-right-regular" size={16} />
              <Text type="body-small-medium" tagname="span" className="breadcrumb-current">{agent.name}</Text>
            </div>
            
            <div className="agent-details-title-row">
              <div className="agent-details-title-left">
                <Text type="heading-large-bold" tagname="h1">{agent.name}</Text>
                <Chip label={agent.version} size={24} />
                <div className={`agent-status-indicator status-${agent.status}`}>{agent.status}</div>
              </div>
              <div className="agent-details-actions">
              </div>
            </div>
        </div>

        {/* Run Summary Strip - shown when run is complete */}
        {agentState === 'done' && runSummary && (
          <div className="run-summary-strip">
            <div className="run-summary-left">
              <div className="run-summary-status">
                <Icon name="check-circle-filled" size={20} />
                <Text type="body-large-bold" tagname="span">Transfer complete</Text>
              </div>
              <Text type="body-midsize-medium" tagname="div" className="run-summary-details">
                {runSummary.sourceUserName} → {runSummary.targetUserName} · {runSummary.settingsUpdated} settings updated · {runSummary.guardrailBlocks} guardrail blocks · {runSummary.durationSeconds}s
              </Text>
            </div>
            <div className="run-summary-right">
              {/* Optional: Run ID or timestamp */}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
            <div style={{ flex: '0 0 30%', minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
                {renderActionDock()}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {renderAdaptiveCanvas()}
            </div>
        </div>
    </div>
  );
};

export default AgentWorkspacePage;
