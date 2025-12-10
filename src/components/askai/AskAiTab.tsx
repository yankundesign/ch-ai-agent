import React, { useState, useEffect, useRef } from 'react';
import { Text, Button, Icon } from '@momentum-design/components/react';
import type { AskAiTabProps, ChatMessage } from '../../types/askAi.types';
import { callAskAiApi, generateMessageId } from '../../utils/askAiAgent';
import './askai.css';

const AskAiTab: React.FC<AskAiTabProps> = ({
  agentName,
  sourceUser,
  targetUser,
  runSummary,
  settingsDiff,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context line for display
  const buildContextLine = (): string => {
    const parts: string[] = [agentName];

    if (sourceUser && targetUser) {
      parts.push(`${sourceUser.name} → ${targetUser.name}`);
    }

    if (runSummary.id) {
      parts.push(`Run ${runSummary.id}`);
    }

    return parts.join(' · ');
  };

  // Get initial system message based on run status
  const getInitialMessage = (): string => {
    switch (runSummary.status) {
      case 'idle':
        return 'You can ask what this agent does or how it will affect a user. Chat here will never make changes - use the controls on the left to run or approve.';
      case 'awaitingApproval':
        return 'Changes are ready for review. I can help explain the proposed changes shown in Preview. Use Approve & Apply or Reject in the Control Panel to commit the changes.';
      case 'completed':
        return 'This run is complete. Ask what changed for the target user or why certain settings were left unchanged.';
      case 'running':
        return 'The agent is currently running. I can explain what it is doing and what to expect.';
      default:
        return 'How can I help you understand this agent?';
    }
  };

  // Handle sending a message
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      // Call API with full conversation context
      const replyText = await callAskAiApi({
        messages: [...messages, userMessage],
        agentName,
        sourceUser,
        targetUser,
        runSummary,
        settingsDiff,
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'system',
        content: 'Sorry, I could not process your request. Please try again later.',
        createdAt: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key (Shift+Enter for new line, Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="ask-ai-container">
      {/* Header */}
      <div className="ask-ai-header">
        <div className="ask-ai-title">
          <Icon name="bot-regular" size={20} />
          <h4 className="ask-ai-title-text">
            Ask AI agent
          </h4>
        </div>
        <div className="ask-ai-info-banner">
          <Icon name="info-circle-regular" size={16} />
          <p className="ask-ai-helper-text">
            Get explanations and help reviewing changes. Actions are always performed via the
            Control Panel, not from this chat.
          </p>
        </div>
      </div>

      {/* Context Line */}
      <div className="ask-ai-context">
        <Text type="body-small-medium" tagname="div">
          {buildContextLine()}
        </Text>
      </div>

      {/* Messages Area */}
      <div className="ask-ai-messages">
        {messages.length === 0 ? (
          // Empty state with initial guidance
          <div className="ask-ai-empty-state">
            <div className="ask-ai-empty-icon">
              <Icon name="chat-regular" size={32} />
            </div>
            <p className="ask-ai-empty-title">
              Ask me anything
            </p>
            <p className="ask-ai-empty-description">
              {getInitialMessage()}
            </p>
          </div>
        ) : (
          // Render messages
          <>
            {messages.map((message) => (
              <div key={message.id} className={`ask-ai-message ask-ai-message-${message.role}`}>
                <div className="ask-ai-message-avatar">
                  {message.role === 'user' && <Icon name="user-regular" size={18} />}
                  {message.role === 'assistant' && <Icon name="bot-regular" size={18} />}
                  {message.role === 'system' && <Icon name="info-circle-regular" size={18} />}
                </div>
                <div className="ask-ai-message-content">
                  <div className="ask-ai-message-bubble">
                    <Text type="body-midsize-medium" tagname="p" className="ask-ai-message-text">
                      {message.content}
                    </Text>
                  </div>
                  <Text
                    type="body-small-medium"
                    tagname="span"
                    className="ask-ai-message-time"
                  >
                    {formatTime(message.createdAt)}
                  </Text>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isSending && (
              <div className="ask-ai-loading">
                <div className="ask-ai-message-avatar">
                  <Icon name="bot-regular" size={18} />
                </div>
                <div className="ask-ai-loading-bubble">
                  <div className="ask-ai-loading-dot"></div>
                  <div className="ask-ai-loading-dot"></div>
                  <div className="ask-ai-loading-dot"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Row */}
      <div className="ask-ai-input-row">
        <textarea
          className="ask-ai-input"
          placeholder="Ask what this agent does, or to explain the changes."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          rows={1}
        />
        <Button
          variant="primary"
          size={40}
          prefixIcon="send-filled"
          aria-label="Send message"
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className="ask-ai-send-btn"
        />
      </div>
    </div>
  );
};

export default AskAiTab;

