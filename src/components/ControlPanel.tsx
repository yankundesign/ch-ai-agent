import React, { useState, useEffect, useRef } from 'react';
import { Text, Button, Icon, Accordion } from '@momentum-design/components/react';
import type { AdvancedSettings } from '../types/agentDetails.types';
import './controlpanel.css';

// --- Types ---
export type RunPhase = 'idle' | 'running' | 'awaitingApproval' | 'completed';
export type MessageRole = 'system' | 'agent' | 'user';

export interface PanelMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: string;
}

export interface ControlPanelProps {
  // Config state
  sourceUser: string;
  targetUser: string;
  advancedSettings: AdvancedSettings;
  onSourceUserChange: (user: string) => void;
  onTargetUserChange: (user: string) => void;
  onAdvancedSettingChange: (key: keyof AdvancedSettings, value: boolean) => void;
  
  // Run state
  runPhase: RunPhase;
  messages: PanelMessage[];
  onAddMessage: (role: MessageRole, content: string) => void;
  setupIntent?: 'run' | 'test' | null;
  
  // Actions
  onRunAgent: () => void;
  onStopRun: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRunAnother: () => void;
  onBackToOverview: () => void;
  onClose?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  sourceUser,
  targetUser,
  advancedSettings,
  onSourceUserChange,
  onTargetUserChange,
  onAdvancedSettingChange,
  runPhase,
  messages,
  onAddMessage,
  setupIntent,
  onRunAgent,
  onStopRun,
  onApprove,
  onReject,
  onRunAnother,
  onBackToOverview,
  onClose,
}) => {
  // Local state
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [showValidationTooltip, setShowValidationTooltip] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const bodyRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Auto-collapse configuration when agent starts running, expand when idle
  useEffect(() => {
    if (runPhase === 'running' || runPhase === 'awaitingApproval') {
      setIsConfigCollapsed(true);
    } else if (runPhase === 'idle') {
      setIsConfigCollapsed(false);
    }
  }, [runPhase]);

  // Messages are now managed by parent component

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

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

  // Previous values for detecting config changes
  const prevSourceUserRef = useRef(sourceUser);
  const prevTargetUserRef = useRef(targetUser);

  useEffect(() => {
    if (prevSourceUserRef.current !== sourceUser || prevTargetUserRef.current !== targetUser) {
      if (sourceUser && targetUser) {
        const sourceName = sourceUser.split(' (')[0];
        const targetName = targetUser.split(' (')[0];
        onAddMessage('system', `Config updated: ${sourceName} → ${targetName}.`);
      }
      prevSourceUserRef.current = sourceUser;
      prevTargetUserRef.current = targetUser;
    }
  }, [sourceUser, targetUser]);

  // --- Handlers ---
  const handleRunClick = () => {
    if (!sourceUser || !targetUser) {
      setShowValidationTooltip(true);
      setTimeout(() => setShowValidationTooltip(false), 3000);
      return;
    }
    onRunAgent();
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    onAddMessage('user', chatInput);
    setChatInput('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      onAddMessage('agent', "Caller ID controls what number/name is shown to recipients. In this transfer, it will inherit the source user's Caller ID settings.");
    }, 800);
  };

  const handleChatKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  // --- Status pill mapping ---
  const getStatusPill = () => {
    switch (runPhase) {
      case 'idle':
        return { label: 'Not running', className: 'status-pill-idle' };
      case 'running':
        return { label: 'Running...', className: 'status-pill-running', icon: 'spinner-partial-filled' };
      case 'awaitingApproval':
        return { label: 'Approval required', className: 'status-pill-approval' };
      case 'completed':
        return { label: 'Run complete', className: 'status-pill-completed' };
      default:
        return { label: 'Unknown', className: 'status-pill-idle' };
    }
  };

  // Count enabled advanced settings
  const countEnabledSettings = () => {
    return Object.values(advancedSettings).filter(Boolean).length;
  };

  // Get config summary for collapsed state
  const getConfigSummary = () => {
    if (!sourceUser || !targetUser) {
      return 'No configuration set';
    }
    const sourceName = sourceUser.split(' (')[0];
    const targetName = targetUser.split(' (')[0];
    const enabledCount = countEnabledSettings();
    return `${sourceName} → ${targetName} · ${enabledCount} setting${enabledCount === 1 ? '' : 's'} enabled`;
  };

  // --- Render Sections ---

  const renderHeader = () => {
    const statusPill = getStatusPill();
    const isDisabled = runPhase !== 'idle';

    return (
      <header className="cp-header">
        {/* Control panel title row */}
        <div className="cp-header-title-row">
          <h3>Control panel</h3>
          {onClose && runPhase === 'idle' && (
            <button
              className="cp-close-button"
              onClick={onClose}
              aria-label="Close control panel"
            >
              <Icon name="cancel-regular" size={20} />
            </button>
          )}
        </div>

        {/* Configuration section */}
        <div className="cp-config">
          <div className="cp-config-header">
            <h4>Configuration</h4>
            {runPhase !== 'idle' && (
              <button
                className="config-collapse-button"
                onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                aria-label={isConfigCollapsed ? 'Expand configuration' : 'Collapse configuration'}
              >
                <Icon name={isConfigCollapsed ? 'arrow-down-regular' : 'arrow-up-regular'} size={16} />
              </button>
            )}
          </div>

          {isConfigCollapsed ? (
            <div className="config-collapsed-summary">
              <Text type="body-small-medium" tagname="p">{getConfigSummary()}</Text>
            </div>
          ) : (
            <div className={`config-expanded-content ${isDisabled ? 'config-disabled' : ''}`}>
              <div className="form-field">
                <Text type="body-small-medium" tagname="div">Source User *</Text>
                <div className="custom-dropdown-wrapper">
                  <div
                    className="form-select custom-dropdown-trigger"
                    onClick={() => !isDisabled && setSourceDropdownOpen(!sourceDropdownOpen)}
                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    {sourceUser || 'Select user...'}
                  </div>
                  {sourceDropdownOpen && !isDisabled && (
                    <div className="dropdown-menu">
                      <div
                        className={`dropdown-item ${sourceUser === 'John Doe (john@co.com)' ? 'selected' : ''}`}
                        onClick={() => {
                          onSourceUserChange('John Doe (john@co.com)');
                          setSourceDropdownOpen(false);
                        }}
                      >
                        <Text type="body-small-medium" tagname="span">John Doe (john@co.com)</Text>
                        {sourceUser === 'John Doe (john@co.com)' && <Icon name="check-regular" size={16} />}
                      </div>
                      <div
                        className={`dropdown-item ${sourceUser === 'Sarah Smith (sarah@co.com)' ? 'selected' : ''}`}
                        onClick={() => {
                          onSourceUserChange('Sarah Smith (sarah@co.com)');
                          setSourceDropdownOpen(false);
                        }}
                      >
                        <Text type="body-small-medium" tagname="span">Sarah Smith (sarah@co.com)</Text>
                        {sourceUser === 'Sarah Smith (sarah@co.com)' && <Icon name="check-regular" size={16} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <Text type="body-small-medium" tagname="div">Target User *</Text>
                <div className="custom-dropdown-wrapper">
                  <div
                    className="form-select custom-dropdown-trigger"
                    onClick={() => !isDisabled && setTargetDropdownOpen(!targetDropdownOpen)}
                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    {targetUser || 'Select user...'}
                  </div>
                  {targetDropdownOpen && !isDisabled && (
                    <div className="dropdown-menu">
                      <div
                        className={`dropdown-item ${targetUser === 'Sasha Newhire (sasha@co.com)' ? 'selected' : ''}`}
                        onClick={() => {
                          onTargetUserChange('Sasha Newhire (sasha@co.com)');
                          setTargetDropdownOpen(false);
                        }}
                      >
                        <Text type="body-small-medium" tagname="span">Sasha Newhire (sasha@co.com)</Text>
                        {targetUser === 'Sasha Newhire (sasha@co.com)' && <Icon name="check-regular" size={16} />}
                      </div>
                      <div
                        className={`dropdown-item ${targetUser === 'Alex Johnson (alex@co.com)' ? 'selected' : ''}`}
                        onClick={() => {
                          onTargetUserChange('Alex Johnson (alex@co.com)');
                          setTargetDropdownOpen(false);
                        }}
                      >
                        <Text type="body-small-medium" tagname="span">Alex Johnson (alex@co.com)</Text>
                        {targetUser === 'Alex Johnson (alex@co.com)' && <Icon name="check-regular" size={16} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Accordion headerText="Advanced settings" expanded={false} size="small">
                <div className="advanced-settings-list">
                  {/* Numbers & identity */}
                  <div className="form-field-toggle">
                    <div className="toggle-label-group">
                      <Text type="body-small-medium" tagname="div">Numbers & identity</Text>
                      <Text type="body-small-medium" tagname="span" className="toggle-description">
                        Directory numbers, extensions, caller ID, and emergency callback number.
                      </Text>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={advancedSettings.numbersIdentity}
                        onChange={(e) => onAdvancedSettingChange('numbersIdentity', e.target.checked)}
                        disabled={isDisabled}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Voicemail & greetings */}
                  <div className="form-field-toggle">
                    <div className="toggle-label-group">
                      <Text type="body-small-medium" tagname="div">Voicemail & greetings</Text>
                      <Text type="body-small-medium" tagname="span" className="toggle-description">
                        Voicemail enablement, language, timezone, and personal greetings.
                      </Text>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={advancedSettings.voicemailGreetings}
                        onChange={(e) => onAdvancedSettingChange('voicemailGreetings', e.target.checked)}
                        disabled={isDisabled}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Call handling rules */}
                  <div className="form-field-toggle">
                    <div className="toggle-label-group">
                      <Text type="body-small-medium" tagname="div">Call handling rules</Text>
                      <Text type="body-small-medium" tagname="span" className="toggle-description">
                        Forwarding, anonymous call rejection, call waiting, and schedules.
                      </Text>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={advancedSettings.callHandlingRules}
                        onChange={(e) => onAdvancedSettingChange('callHandlingRules', e.target.checked)}
                        disabled={isDisabled}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Between-user permissions */}
                  <div className="form-field-toggle">
                    <div className="toggle-label-group">
                      <Text type="body-small-medium" tagname="div">Between-user permissions</Text>
                      <Text type="body-small-medium" tagname="span" className="toggle-description">
                        Monitoring, barge-in, push-to-talk, and executive assistant relationships.
                      </Text>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={advancedSettings.betweenUserPermissions}
                        onChange={(e) => onAdvancedSettingChange('betweenUserPermissions', e.target.checked)}
                        disabled={isDisabled}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* User experience integrations */}
                  <div className="form-field-toggle">
                    <div className="toggle-label-group">
                      <Text type="body-small-medium" tagname="div">User experience integrations</Text>
                      <Text type="body-small-medium" tagname="span" className="toggle-description">
                        Third-party integrations and app settings.
                      </Text>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={advancedSettings.userExperienceIntegrations}
                        onChange={(e) => onAdvancedSettingChange('userExperienceIntegrations', e.target.checked)}
                        disabled={isDisabled}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Recording & agent settings */}
                  <div className="form-field-toggle">
                    <div className="toggle-label-group">
                      <Text type="body-small-medium" tagname="div">Recording & agent settings</Text>
                      <Text type="body-small-medium" tagname="span" className="toggle-description">
                        Call recording configuration, receptionist client, and agent caller ID.
                      </Text>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={advancedSettings.recordingAgentSettings}
                        onChange={(e) => onAdvancedSettingChange('recordingAgentSettings', e.target.checked)}
                        disabled={isDisabled}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </Accordion>
            </div>
          )}
        </div>
      </header>
    );
  };

  const renderChatHistory = () => {
    const formatTimestamp = (timestamp?: string) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const getSenderLabel = (role: MessageRole) => {
      if (role === 'user') {
        return 'You';
      }
      // Treat both 'agent' and 'system' as 'Agent'
      return 'Agent';
    };

    const getSenderIcon = (role: MessageRole) => {
      if (role === 'user') {
        return 'user-regular';
      }
      // Treat both 'agent' and 'system' as agent icon
      return 'bot-regular';
    };

    // Always render the body element to maintain flex layout
    // Only show messages after run starts
    const showMessages = runPhase !== 'idle' && messages.length > 0;

    return (
      <div className="control-panel-body" ref={chatHistoryRef}>
        {showMessages && (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message-item message-${message.role}`}>
                <div className="message-header">
                  <div className={`message-avatar ${message.role !== 'user' ? 'avatar-agent' : 'avatar-user'}`}>
                    {message.role === 'user' ? 'M' : 'AI'}
                  </div>
                  <span className="message-sender">{getSenderLabel(message.role)}</span>
                  {message.timestamp && (
                    <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
                  )}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFooter = () => {
    const showChatInput = runPhase !== 'idle';

    return (
      <footer className="cp-footer">
        {/* Phase actions section */}
        <div className="cp-phase-actions">
          
          {runPhase === 'idle' && (
            <>
              {setupIntent === 'run' && (
                <div style={{ position: 'relative', width: '100%' }}>
                  <Button
                    variant="primary"
                    prefixIcon="play-circle-regular"
                    onClick={handleRunClick}
                    disabled={false}
                  >
                    Run agent
                  </Button>
                  {showValidationTooltip && (
                    <div className="validation-tooltip">
                      Please select both source and target users above
                    </div>
                  )}
                </div>
              )}
              {setupIntent === 'test' && (
                <div style={{ position: 'relative', width: '100%' }}>
                  <Button
                    variant="secondary"
                    prefixIcon="analysis-regular"
                    onClick={handleRunClick}
                    disabled={false}
                  >
                    Test agent
                  </Button>
                  {showValidationTooltip && (
                    <div className="validation-tooltip">
                      Please select both source and target users above
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {runPhase === 'running' && (
            <Button
              variant="secondary"
              prefixIcon="stop-circle-regular"
              onClick={onStopRun}
            >
              Stop run
            </Button>
          )}

          {runPhase === 'awaitingApproval' && (
            <>
              <Button variant="primary" onClick={onApprove}>
                Approve & apply
              </Button>
              <Button variant="secondary" onClick={onReject}>
                Reject
              </Button>
            </>
          )}

          {runPhase === 'completed' && (
            <>
              <Button
                variant="primary"
                prefixIcon="refresh-regular"
                onClick={onRunAnother}
              >
                Run another transfer
              </Button>
              <button className="cp-link-button" onClick={onBackToOverview}>
                <Icon name="arrow-left-regular" size={16} />
                <span>Back to overview</span>
              </button>
            </>
          )}
        </div>

        {/* Chat input - only visible after run starts */}
        {showChatInput && (
          <div className="cp-chat-composer">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask the agent a question"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
            />
            <button
              className="chat-send-button"
              onClick={handleChatSubmit}
              disabled={!chatInput.trim()}
              aria-label="Send message"
            >
              <Icon name="send-regular" size={16} />
            </button>
          </div>
        )}
      </footer>
    );
  };

  return (
    <div className="control-panel-root">
      <div className="cp-frame">
        {renderHeader()}
        {renderChatHistory()}
        {renderFooter()}
      </div>
    </div>
  );
};

export default ControlPanel;

