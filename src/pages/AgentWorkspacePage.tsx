import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Text, Button, Icon, Chip, Accordion } from '@momentum-design/components/react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockAgentDatabase } from '../data/mockAgentDetails';
import type { AgentDetails, WorkflowStep, AgentInput, Guardrail, RunHistory, AdvancedSettings } from '../types/agentDetails.types';
import ControlPanel, { type PanelMessage, type RunPhase, type MessageRole } from '../components/ControlPanel';
import Tabs from '../components/tabs/Tabs';
import { getGuardrailIcon } from '../utils/iconMapping';
import './agentdetailspage.css';
import './runagentpage.css';
import './agentworkspacepage.css';

// --- Types ---
type ViewMode = 'overview' | 'execution';
type SkillTab = 'run' | 'details';
type AgentState = 'idle' | 'running' | 'review' | 'done';

type MessageType = 'user' | 'system' | 'config';
type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'review' | 'failed';

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
  const [activeTab, setActiveTab] = useState<SkillTab>('run');
  const [agentState, setAgentState] = useState<AgentState>('idle');
  
  // Control Panel visibility state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupIntent, setSetupIntent] = useState<'run' | 'test' | null>(null);
  const [showCoachMark, setShowCoachMark] = useState(false);
  
  // Refs for focus management
  const coachMarkButtonRef = useRef<HTMLButtonElement>(null);
  const configSectionRef = useRef<HTMLDivElement>(null);

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
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  const [visibleFindingsCount, setVisibleFindingsCount] = useState<number>(0);
  
  // Control Panel State
  const [panelMessages, setPanelMessages] = useState<PanelMessage[]>([]);
  
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

  // Focus management when panel opens
  useEffect(() => {
    if (isSetupOpen && agentState === 'idle') {
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = 'Control panel opened. Configure your transfer settings.';
      document.body.appendChild(announcement);
      
      // Focus on coach mark button when it appears
      if (showCoachMark && coachMarkButtonRef.current) {
        setTimeout(() => {
          coachMarkButtonRef.current?.focus();
        }, 350); // After animation completes
      }
      
      // Cleanup
      return () => {
        if (announcement.parentNode) {
          document.body.removeChild(announcement);
        }
      };
    }
  }, [isSetupOpen, showCoachMark, agentState]);

  // Handle tab switching - reset panel state on Details tab
  useEffect(() => {
    if (activeTab === 'details' && isSetupOpen && agentState === 'idle') {
      setIsSetupOpen(false);
      setShowCoachMark(false);
    }
  }, [activeTab, agentState, isSetupOpen]);

  // --- Handlers ---
  const handleOpenSetup = (intent: 'run' | 'test') => {
    setIsSetupOpen(true);
    setSetupIntent(intent);
    setShowCoachMark(true);
  };

  const handleCloseSetup = () => {
    if (agentState === 'idle') {
      setIsSetupOpen(false);
      setSetupIntent(null);
      setShowCoachMark(false);
    }
  };

  const handleAdvancedSettingChange = (key: keyof AdvancedSettings, value: boolean) => {
    setAdvancedSettings(prev => ({ ...prev, [key]: value }));
  };

  const appendPanelMessage = (role: MessageRole, content: string) => {
    const newMessage: PanelMessage = {
      id: `panel-msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setPanelMessages(prev => [...prev, newMessage]);
  };

  const handleStartRun = () => {
    if (!sourceUser || !targetUser) {
      alert('Please select both Source and Target users');
      return;
    }

    setViewMode('execution');
    setAgentState('running');
    setIsSetupOpen(true); // Keep panel open during run
    setShowCoachMark(false); // Hide coach mark when run starts
    setActiveStepIndex(0);
    setSelectedStepId('step1'); // Auto-select first step

    const configMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: `Transfer settings from ${sourceUser} to ${targetUser}`,
      timestamp: new Date(),
    };
    setMessages([configMessage]);
    
    // Add panel message
    const sourceName = sourceUser.split(' (')[0];
    const targetName = targetUser.split(' (')[0];
    appendPanelMessage('system', `Run started for ${sourceName} → ${targetName}.`);

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
        setSelectedStepId('step2'); // Auto-select Analyze Settings step
        setVisibleFindingsCount(0); // Reset findings count
        
        // Progressive findings reveal
        const changedSettings = callingSettingsDiff.filter(r => r.isChanged);
        const totalFindings = changedSettings.length;
        const revealInterval = 800; // 800ms between each finding
        
        changedSettings.forEach((_, index) => {
          setTimeout(() => {
            setVisibleFindingsCount(index + 1);
          }, revealInterval * (index + 1));
        });
        
        // Complete step 2 after all findings are revealed
        const step2Duration = revealInterval * totalFindings + 1000; // Add 1s buffer
        setTimeout(() => {
          setExecutionSteps(prev => prev.map((step, idx) => 
            idx === 1 ? { ...step, status: 'completed', duration: '4.8s' } : 
            idx === 2 ? { ...step, status: 'review' } : step
          ));
          setActiveStepIndex(2);
          setSelectedStepId('step3'); // Auto-select Review Changes step
          setAgentState('review');
          appendPanelMessage('agent', 'Please review the settings and continue.');
          
          const systemMsg2: Message = {
            id: `msg-${Date.now()}-2`,
            type: 'system',
            content: 'Analysis complete. Please review changes in the Inspector panel.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, systemMsg2]);
        }, step2Duration); 
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
    setSelectedStepId('step4'); // Auto-select Apply Transfer step
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
      appendPanelMessage('system', '✓ Transfer completed successfully! All settings have been applied.');
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
    setIsSetupOpen(false); // Close panel after run completes
    setSetupIntent(null);
    setShowCoachMark(false);
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
    setSelectedStepId(null); // Reset selection
    setMessages([]);
    setPanelMessages([]);
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

  const handleStepClick = (stepId: string) => {
    const step = executionSteps.find(s => s.id === stepId);
    if (!step) return;
    
    // Only allow selection of current or completed steps
    const canSelect = step.status === 'running' || 
                      step.status === 'completed' || 
                      step.status === 'review';
    
    if (canSelect) {
      setSelectedStepId(stepId);
    }
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

  // --- Monitor Workspace Helpers ---

  const renderStepRail = () => {
    return (
      <div className="monitor-step-rail">
        {executionSteps.map((step, index) => {
          const isSelected = selectedStepId === step.id;
          const isClickable = step.status === 'running' || step.status === 'completed' || step.status === 'review';
          
          return (
            <div
              key={step.id}
              className={`step-rail-item ${isSelected ? 'step-selected' : ''} ${!isClickable ? 'step-disabled' : ''} ${getStepStatusClass(step.status)}`}
              onClick={() => isClickable && handleStepClick(step.id)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              <div className="step-circle">
                {step.status === 'completed' && <Icon name="check-regular" size={16} />}
              </div>
              <div className="step-connector-line"></div>
              <div className="step-label">{step.title}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStepDetails = (stepId: string | null) => {
    if (!stepId) {
      return (
        <div className="step-detail-placeholder">
          <Text type="body-midsize-medium" tagname="p">Select a step to view details</Text>
        </div>
      );
    }

    const step = executionSteps.find(s => s.id === stepId);
    if (!step) return null;

    // Helper: Get status label for header
    const getStatusLabel = (status: WorkflowStepStatus) => {
      switch (status) {
        case 'completed': return 'Completed';
        case 'running': return 'In progress';
        case 'review': return 'Review required';
        case 'failed': return 'Failed';
        default: return 'Pending';
      }
    };

    // Helper: Get status class for styling
    const getStatusClass = (status: WorkflowStepStatus) => {
      switch (status) {
        case 'completed': return 'status-chip-completed';
        case 'running': return 'status-chip-running';
        case 'review': return 'status-chip-review';
        case 'failed': return 'status-chip-failed';
        default: return 'status-chip-pending';
      }
    };

    // Helper: Generate current time
    const getCurrentTime = () => {
      const now = new Date();
      return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Helper: Get source and target names
    const getSourceName = () => sourceUser ? sourceUser.split(' (')[0] : 'Source';
    const getTargetName = () => targetUser ? targetUser.split(' (')[0] : 'Target';

    // Common report header for all steps
    const renderReportHeader = (title: string, status: WorkflowStepStatus) => (
      <div className="step-report-header">
        <div className="step-report-title-row">
          <h3>{title}</h3>
          <div className={`step-report-status-chip ${getStatusClass(status)}`}>
            <Text type="body-small-medium" tagname="span">{getStatusLabel(status)}</Text>
          </div>
        </div>
        <div className="step-report-metadata-row">
          <span>Source: {getSourceName()}</span>
          <span>·</span>
          <span>Target: {getTargetName()}</span>
          <span>·</span>
          <span>Generated: {getCurrentTime()}</span>
          <span>·</span>
          <span>Scope: {callingSettingsDiff.filter(r => r.isChanged).length} settings</span>
        </div>
        <div className="step-report-risk-pill">
          <Text type="body-small-medium" tagname="span">Risk: Low</Text>
        </div>
      </div>
    );

    // Step-specific content
    switch (stepId) {
      case 'step1': // Fetch Profiles
        return (
          <div className="step-detail-container">
            {renderReportHeader('Fetch Profiles', step.status)}
            
            {/* Collapsible Procedural Sections */}
            <Accordion headerText="Actions performed" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul>
                  <li><Text type="body-small-medium" tagname="span">Read source user calling settings</Text></li>
                  <li><Text type="body-small-medium" tagname="span">Read target user calling settings</Text></li>
                  <li><Text type="body-small-medium" tagname="span">Validate admin permissions</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Success criteria" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul className="criteria-list">
                  <li><Icon name="check-regular" size={14} /><Text type="body-small-medium" tagname="span">Source + target profiles retrieved</Text></li>
                  <li><Icon name="check-regular" size={14} /><Text type="body-small-medium" tagname="span">Access validated</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Evidence & trace" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Connection logs and API responses will appear here.</Text>
              </div>
            </Accordion>

            <Accordion headerText="Agent decision log" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Agent reasoning and decision trail will appear here.</Text>
              </div>
            </Accordion>
          </div>
        );

      case 'step2': // Analyze Settings
        const changedSettings = callingSettingsDiff.filter(r => r.isChanged);
        const visibleFindings = step.status === 'running' 
          ? changedSettings.slice(0, visibleFindingsCount) 
          : changedSettings;
        
        return (
          <div className="step-detail-container">
            {renderReportHeader('Analyze Settings', step.status)}
            
            {/* PRIMARY ARTIFACT - Findings */}
            <div className="step-report-artifact">
              <div className="artifact-header">
                <Icon name="analysis-regular" size={20} />
                <Text type="body-large-bold" tagname="h4">Findings</Text>
              </div>
              <div className="artifact-content">
                <ul className="findings-list">
                  {visibleFindings.map((row, idx) => (
                    <li key={idx} className={row.isDangerous ? 'finding-warning' : 'finding-normal'}>
                      {row.isDangerous && <Icon name="warning-regular" size={16} />}
                      <Text type="body-midsize-medium" tagname="span">{row.setting}: {row.currentValue} → {row.newValue}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Collapsible Procedural Sections */}
            <Accordion headerText="Actions performed" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul>
                  <li><Text type="body-small-medium" tagname="span">Compare categories (Call forwarding, DND, Voicemail, Privacy)</Text></li>
                  <li><Text type="body-small-medium" tagname="span">Detect conflicts / missing licenses</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Success criteria" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul className="criteria-list">
                  <li><Icon name="check-regular" size={14} /><Text type="body-small-medium" tagname="span">Differences categorized</Text></li>
                  <li><Icon name="check-regular" size={14} /><Text type="body-small-medium" tagname="span">Risks flagged</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Evidence & trace" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Analysis rules and comparison results will appear here.</Text>
              </div>
            </Accordion>

            <Accordion headerText="Agent decision log" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Agent reasoning and decision trail will appear here.</Text>
              </div>
            </Accordion>
          </div>
        );

      case 'step3': // Review Changes
        const changedCount = callingSettingsDiff.filter(r => r.isChanged).length;
        const dangerousCount = callingSettingsDiff.filter(r => r.isDangerous).length;
        
        return (
          <div className="step-detail-container">
            {renderReportHeader('Review Changes', step.status)}
            
            {agentState === 'review' && (
              <div className="approval-notice">
                <Icon name="priority-circle-filled" size={20} />
                <Text type="body-midsize-medium" tagname="span">Waiting for approval</Text>
              </div>
            )}

            {/* PRIMARY ARTIFACT - Diff Table (MOVED FIRST) */}
            <div className="step-report-artifact">
              <div className="calling-settings-diff">
                <div className="diff-header">
                  <Icon name="handset-regular" size={20} />
                  <Text type="body-large-bold" tagname="h4">
                    Proposed changes: {getSourceName()} → {getTargetName()}
                  </Text>
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
            </div>

            {/* Collapsible Procedural Sections */}
            <Accordion headerText="Actions performed" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul>
                  <li><Text type="body-small-medium" tagname="span">Generate proposed changes</Text></li>
                  <li><Text type="body-small-medium" tagname="span">Mark policy-sensitive changes</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Success criteria" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul className="criteria-list">
                  <li><Icon name="check-regular" size={14} /><Text type="body-small-medium" tagname="span">Admin reviewed proposed changes</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Evidence & trace" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Change generation logic and policy evaluation will appear here.</Text>
              </div>
            </Accordion>

            <Accordion headerText="Agent decision log" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Agent reasoning and decision trail will appear here.</Text>
              </div>
            </Accordion>
          </div>
        );

      case 'step4': // Apply Transfer
        return (
          <div className="step-detail-container">
            {renderReportHeader('Apply Transfer', step.status)}
            
            {/* PRIMARY ARTIFACT - Result Summary */}
            {agentState === 'done' ? (
              <div className="step-report-artifact">
                <div className="output-success">
                  <div className="success-summary">
                    <Icon name="check-circle-filled" size={24} />
                    <Text type="heading-small-bold" tagname="span">Transfer completed successfully</Text>
                  </div>
                  <div className="success-details">
                    <Text type="body-midsize-medium" tagname="p">{callingSettingsDiff.filter(r => r.isChanged).length} settings updated in 820ms</Text>
                    <Text type="body-small-medium" tagname="p" style={{ color: 'var(--mds-color-theme-text-secondary)' }}>Completed at {getCurrentTime()}</Text>
                  </div>
                  <a href="#" className="audit-log-link">
                    <Icon name="document-regular" size={16} />
                    <Text type="body-small-medium" tagname="span">View full audit log</Text>
                  </a>
                </div>
              </div>
            ) : (
              <div className="step-report-artifact">
                <div className="output-placeholder">
                  <Text type="body-midsize-medium" tagname="p">⏳ Pending approval...</Text>
                </div>
              </div>
            )}

            {/* Collapsible Procedural Sections */}
            <Accordion headerText="Actions performed" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul>
                  <li><Text type="body-small-medium" tagname="span">Apply approved changes to target user</Text></li>
                  <li><Text type="body-small-medium" tagname="span">Write audit entry</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Success criteria" expanded={true} size="small">
              <div className="accordion-section-content">
                <ul className="criteria-list">
                  <li><Icon name="check-regular" size={14} /><Text type="body-small-medium" tagname="span">Changes applied successfully</Text></li>
                  <li><Icon name="check-regular" size={14} /><Text type="body-small-medium" tagname="span">Audit recorded</Text></li>
                </ul>
              </div>
            </Accordion>
            
            <Accordion headerText="Evidence & trace" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Write confirmations and API responses will appear here.</Text>
              </div>
            </Accordion>

            <Accordion headerText="Agent decision log" expanded={false} size="small">
              <div className="evidence-content">
                <Text type="body-small-medium" tagname="p" className="evidence-placeholder">Agent reasoning and decision trail will appear here.</Text>
              </div>
            </Accordion>
          </div>
        );

      default:
        return null;
    }
  };

  // --- Render Sections ---

  // Render Overview + Workflow for Run tab idle state and Details tab
  // Combined card for Run tab with compact workflow
  const renderRunOverview = () => {
    return (
      <div className="agent-overview-workflow-row">
        {/* Combined Overview Card */}
        <div className="agent-overview-card">
          <div className="overview-header">
            <Text type="heading-small-bold" tagname="h3" className="overview-title">Overview</Text>
            <div className="overview-badges-container">
              <span className="badge-category">{agent.category}</span>
              {agent.complexity && <span className="badge-complexity">{agent.complexity}</span>}
            </div>
          </div>
          
          <div className="overview-content">
            
            <div className="overview-description">
              <Text type="body-midsize-medium" tagname="p">{agent.description}</Text>
            </div>
            
            {agent.expectedOutcome && (
              <div className="overview-outcome-box">
                <Text type="body-small-bold" tagname="div" className="outcome-label">EXPECTED OUTCOME</Text>
                <Text type="body-midsize-medium" tagname="p" className="outcome-text">{agent.expectedOutcome}</Text>
              </div>
            )}

            {/* Workflow Section */}
            <div className="skill-overview-workflow">
              <Text tagname="h4" className="workflow-section-header">Workflow</Text>
              <div className="workflow-compact-list">
                <div className="workflow-compact-step">
                  <div className="workflow-step-track">
                    <div className="workflow-hexagon-container">
                      <svg width="32" height="32" viewBox="0 0 32 32" className="workflow-hexagon-bg" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                      </svg>
                      <Icon name="contact-card-regular" size={16} className="workflow-hexagon-icon" />
                    </div>
                    <div className="workflow-connector-line"></div>
                  </div>
                  <div className="workflow-step-text">
                    <Text type="body-midsize-medium" tagname="span">
                      <strong>Fetch profiles</strong> – read current settings for both users
                    </Text>
                  </div>
                </div>

                <div className="workflow-compact-step">
                  <div className="workflow-step-track">
                    <div className="workflow-hexagon-container">
                      <svg width="32" height="32" viewBox="0 0 32 32" className="workflow-hexagon-bg" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                      </svg>
                      <Icon name="search-regular" size={16} className="workflow-hexagon-icon" />
                    </div>
                    <div className="workflow-connector-line"></div>
                  </div>
                  <div className="workflow-step-text">
                    <Text type="body-midsize-medium" tagname="span">
                      <strong>Analyze differences</strong> – detect conflicts or missing licenses
                    </Text>
                  </div>
                </div>

                <div className="workflow-compact-step">
                  <div className="workflow-step-track">
                    <div className="workflow-hexagon-container">
                      <svg width="32" height="32" viewBox="0 0 32 32" className="workflow-hexagon-bg" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                      </svg>
                      <Icon name="document-regular" size={16} className="workflow-hexagon-icon" />
                    </div>
                    <div className="workflow-connector-line"></div>
                  </div>
                  <div className="workflow-step-text">
                    <Text type="body-midsize-medium" tagname="span">
                      <strong>Propose changes</strong> – show you everything that will change
                    </Text>
                  </div>
                </div>

                <div className="workflow-compact-step">
                  <div className="workflow-step-track">
                    <div className="workflow-hexagon-container">
                      <svg width="32" height="32" viewBox="0 0 32 32" className="workflow-hexagon-bg" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                      </svg>
                      <Icon name="check-circle-regular" size={16} className="workflow-hexagon-icon" />
                    </div>
                  </div>
                  <div className="workflow-step-text">
                    <Text type="body-midsize-medium" tagname="span">
                      <strong>Apply transfer</strong> – only after you approve
                    </Text>
                  </div>
                </div>
              </div>
              <a 
                href="#" 
                className="workflow-view-details-link"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('details');
                }}
              >
                <Text type="body-midsize-medium" tagname="span">View full workflow in Details</Text>
                <Icon name="arrow-right-regular" size={16} />
              </a>
            </div>

            {/* CTA Section */}
            {!isSetupOpen && (
            <div className="overview-cta-section">
              <Button
                variant="primary"
                prefixIcon="play-circle-regular"
                onClick={() => handleOpenSetup('run')}
              >
                Run agent
              </Button>
              <Button
                variant="secondary"
                prefixIcon="analysis-regular"
                onClick={() => handleOpenSetup('test')}
              >
                Test agent
              </Button>
            </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Two-card layout for Details tab with full workflow stepper
  const renderDetailsOverview = () => {
    return (
      <div className="agent-overview-workflow-row">
        {/* Agent Overview */}
        <div className="agent-overview-card">
          <div className="overview-header">
            <Text type="heading-small-bold" tagname="h3" className="overview-title">Overview</Text>
            <div className="overview-badges-container">
              <span className="badge-category">{agent.category}</span>
              {agent.complexity && <span className="badge-complexity">{agent.complexity}</span>}
            </div>
          </div>
          
          <div className="overview-content">
            
            <div className="overview-description">
              <Text type="body-midsize-medium" tagname="p">{agent.description}</Text>
            </div>
            
            {agent.expectedOutcome && (
              <div className="overview-outcome-box">
                <Text type="body-small-bold" tagname="div" className="outcome-label">EXPECTED OUTCOME</Text>
                <Text type="body-midsize-medium" tagname="p" className="outcome-text">{agent.expectedOutcome}</Text>
              </div>
            )}
          </div>
        </div>

        {/* Workflow - Full vertical stepper */}
        <div className="agent-details-card workflow-card" style={{ minWidth: 0 }}>
          <Text type="heading-small-bold" tagname="h3" className="card-title">Workflow</Text>
          <div className="workflow-visualization">
            {agent.workflow.map((step: WorkflowStep, index: number) => (
              <div 
                key={step.id} 
                className="workflow-step-timeline"
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
    );
  };

  // Render Run tab content (switches between idle and running state)
  const renderRunTabContent = () => {
    // Idle state: show Overview + Workflow centered
    if (agentState === 'idle') {
      return (
        <div className="run-canvas">
          <div className="run-canvas-inner">
            {/* <div className="run-canvas-hint">
              <Text type="body-midsize-medium" tagname="p">
                Choose users in the Control Panel to run this skill.
              </Text>
            </div> */}
            <div className="run-overview-workflow-stacked">
              {renderRunOverview()}
            </div>
          </div>
        </div>
      );
    }

    // Running/Review/Done state: show Monitor workspace
    const getMonitorStatusPill = () => {
      switch (agentState) {
        case 'running':
          return { label: 'Running', className: 'monitor-status-running' };
        case 'review':
          return { label: 'Approval Required', className: 'monitor-status-approval' };
        case 'done':
          return { label: 'Complete', className: 'monitor-status-complete' };
        default:
          return { label: 'Running', className: 'monitor-status-running' };
      }
    };

    const selectedStep = executionSteps.find(s => s.id === selectedStepId);
    const statusPill = getMonitorStatusPill();

    return (
      <div className="monitor-workspace">
        <div className="monitor-header">
          <div className="monitor-header-left">
            <Text type="heading-small-bold" tagname="h3">Monitor</Text>
            <div className={`monitor-status-pill ${statusPill.className}`}>
              <Text type="body-small-medium" tagname="span">{statusPill.label}</Text>
            </div>
          </div>
          {selectedStep && (
            <div className="monitor-focused-hint">
              <Text type="body-small-medium" tagname="span">Focused step: {selectedStep.title}</Text>
            </div>
          )}
        </div>
        
        <div className="monitor-body">
          {renderStepRail()}
          <div className="monitor-divider"></div>
          <div className="monitor-step-details">
            {renderStepDetails(selectedStepId)}
          </div>
        </div>
      </div>
    );
  };

  // Render Details tab content
  const renderDetailsTabContent = () => {
    return (
      <div className="details-canvas">
        {/* Overview */}
        {renderDetailsOverview()}

        {/* Metrics */}
        <div className="agent-metrics-card">
          <div className="metrics-header">
            <Text type="heading-small-bold" tagname="h3" className="metrics-title">Metrics</Text>
            <div className="metrics-time-badge">
              <Text type="body-small-medium" tagname="span">Last 30 days</Text>
            </div>
          </div>
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
        </div>

        {/* Knowledge */}
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

        {/* Guardrails + Run History */}
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
      </div>
    );
  };

  // Main canvas content renderer
  const renderCanvasContent = () => {
    if (activeTab === 'run') {
      return renderRunTabContent();
    } else {
      return renderDetailsTabContent();
    }
  };

  return (
    <div className="agent-details-wrapper">
        <div className="agent-details-header">
            <div className="agent-details-breadcrumbs">
              <Text type="body-small-medium" tagname="span" className="breadcrumb-item" onClick={() => navigate('/ai-agent')}>AI Agents</Text>
              <Icon name="arrow-right-regular" size={16} />
              <Text type="body-small-medium" tagname="span" className="breadcrumb-current">{agent.name}</Text>
            </div>
            
            <div className="agent-details-title-row">
              <div className="agent-details-title-left">
                <h2>{agent.name}</h2>
                <Chip label={agent.version} size={24} />
                <div className={`agent-status-indicator status-${agent.status}`}>{agent.status}</div>
                <Tabs
                  tabs={[
                    { id: 'run', label: 'Run skill' },
                    { id: 'details', label: 'Details' }
                  ]}
                  activeTabId={activeTab}
                  onTabChange={(tabId) => setActiveTab(tabId as SkillTab)}
                  size="medium"
                />
              </div>
            </div>
        </div>

        <div 
          className="skill-layout" 
          data-panel-open={activeTab === 'run' && (isSetupOpen || agentState !== 'idle')}
        >
            {activeTab === 'run' && (isSetupOpen || agentState !== 'idle') && (
              <div className="skill-left">
                  <ControlPanel
                    sourceUser={sourceUser}
                    targetUser={targetUser}
                    advancedSettings={advancedSettings}
                    onSourceUserChange={setSourceUser}
                    onTargetUserChange={setTargetUser}
                    onAdvancedSettingChange={handleAdvancedSettingChange}
                    runPhase={agentState === 'idle' ? 'idle' : agentState === 'running' ? 'running' : agentState === 'review' ? 'awaitingApproval' : 'completed'}
                    messages={panelMessages}
                    onAddMessage={appendPanelMessage}
                    setupIntent={setupIntent}
                    onRunAgent={handleStartRun}
                    onStopRun={handleStopRun}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRunAnother={handleDone}
                    onBackToOverview={() => navigate('/ai-agent')}
                    onClose={handleCloseSetup}
                  />
                  {showCoachMark && agentState === 'idle' && (
                    <div className="coach-mark-overlay" role="dialog" aria-labelledby="coach-mark-title">
                      <div className="coach-mark-tooltip">
                        <div className="coach-mark-arrow"></div>
                        <div className="coach-mark-content">
                          <Text type="body-large-bold" tagname="h4" className="coach-mark-title" id="coach-mark-title">
                            Configure your transfer
                          </Text>
                          <Text type="body-small-medium" tagname="p" className="coach-mark-body">
                            Select a source and target user, then continue. No changes apply until you approve.
                          </Text>
                          <button
                            ref={coachMarkButtonRef}
                            className="coach-mark-button"
                            onClick={() => setShowCoachMark(false)}
                          >
                            Got it
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}

            <div className={`skill-right skill-right-canvas ${activeTab === 'details' || (!isSetupOpen && agentState === 'idle') ? 'skill-right-full-width' : ''}`}>
                {renderCanvasContent()}
            </div>
        </div>
    </div>
  );
};

export default AgentWorkspacePage;
