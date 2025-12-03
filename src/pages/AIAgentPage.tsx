import React, { useState, useMemo } from 'react';
import { Avatar, Text, Button, ToggleTip } from '@momentum-design/components/react';
import { mockAgents } from '../data/mockAgents';
import type { Agent } from '../types/agent.types';
import AgentCard from '../components/agentcard/AgentCard';
import './aiagentpage.css';

type TabType = 'agents' | 'knowledge' | 'runlog' | 'policies';

const AIAgentPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<TabType>('agents');

    // Calculate metrics
    const metrics = useMemo(() => {
        const total = mockAgents.length;
        const active = mockAgents.filter((a: Agent) => a.status === 'active').length;
        const failing = mockAgents.filter((a: Agent) => a.status === 'failing').length;
        const draft = mockAgents.filter((a: Agent) => a.status === 'draft').length;
        
        return { total, active, failing, draft };
    }, []);

    // Separate agents by source
    const controlHubAgents = useMemo(() => 
        mockAgents.filter((a: Agent) => a.source === 'controlHub'), 
        []
    );
    
    const orgAgents = useMemo(() => 
        mockAgents.filter((a: Agent) => a.source === 'org'), 
        []
    );

    // Event handlers
    const handleTabChange = (tab: TabType) => {
        setSelectedTab(tab);
    };

    const handleOpenAgent = (agent: Agent) => {
        console.log('Open agent', agent.id);
    };

    // Helper to check if tab is active
    const isTabActive = (tab: TabType) => selectedTab === tab;

    // Helper to render tabs
    const renderTabs = () => (
        <div className="ai-agent-tabs">
            <button 
                className={`ai-agent-tab ${isTabActive('agents') ? 'active' : ''}`}
                onClick={() => handleTabChange('agents')}
            >
                AI agents
            </button>
            <button 
                className={`ai-agent-tab ${isTabActive('knowledge') ? 'active' : ''}`}
                onClick={() => handleTabChange('knowledge')}
            >
                Knowledge
            </button>
            <button 
                className={`ai-agent-tab ${isTabActive('runlog') ? 'active' : ''}`}
                onClick={() => handleTabChange('runlog')}
            >
                Run log
            </button>
            <button 
                className={`ai-agent-tab ${isTabActive('policies') ? 'active' : ''}`}
                onClick={() => handleTabChange('policies')}
            >
                Policies & Guardrails
            </button>
        </div>
    );

    // Helper to get placeholder title
    const getPlaceholderTitle = () => {
        switch (selectedTab) {
            case 'knowledge': return 'Knowledge Management';
            case 'runlog': return 'Run Log';
            case 'policies': return 'Policies & Guardrails';
            default: return '';
        }
    };

    // Render placeholder for non-agent tabs
    if (selectedTab !== 'agents') {
        return (
            <div className="ai-agent-page-wrapper">
                <div className="ai-agent-page-header">
                    <div className="ai-agent-page-left-section">
                        <Avatar size={64} iconName='bot-regular'></Avatar>
                    </div>
                    <div className="ai-agent-page-middle-section">
                        <div className="ai-agent-page-middle-section-first-line">
                            <Text type="heading-midsize-bold" tagname='span'>AI agent studio</Text>
                            <Button id="ai-agent-info-icon-button" variant="tertiary" size={20} prefixIcon="info-badge-filled" aria-label="info icon button"></Button>
                            <ToggleTip triggerID='ai-agent-info-icon-button' placement='bottom'>
                                This is the AI Agent page.
                            </ToggleTip>
                        </div>
                        <div className="ai-agent-page-middle-section-second-line">
                            <Text type="body-midsize-medium" tagname='span'>AI Agent workspace</Text>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                {renderTabs()}

                {/* Placeholder content */}
                <div className="ai-agent-placeholder">
                    <Text type="heading-small-bold" tagname="h2">
                        {getPlaceholderTitle()}
                    </Text>
                    <Text type="body-midsize-medium" tagname="p">
                        This section is coming soon.
                    </Text>
                </div>
            </div>
        );
    }

    // Main agents tab content
    return (
        <div className="ai-agent-page-wrapper">
            <div className="ai-agent-page-header">
                <div className="ai-agent-page-left-section">
                    <Avatar size={64} iconName='bot-regular'></Avatar>
                </div>
                <div className="ai-agent-page-middle-section">
                    <div className="ai-agent-page-middle-section-first-line">
                        <Text type="heading-midsize-bold" tagname='span'>AI agent studio</Text>
                        <Button id="ai-agent-info-icon-button" variant="tertiary" size={20} prefixIcon="info-badge-filled" aria-label="info icon button"></Button>
                        <ToggleTip triggerID='ai-agent-info-icon-button' placement='bottom'>
                            This is the AI Agent page.
                        </ToggleTip>
                    </div>
                    <div className="ai-agent-page-middle-section-second-line">
                        <Text type="body-midsize-medium" tagname='span'>AI Agent workspace</Text>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {renderTabs()}

            {/* Metrics strip */}
            {/* <div className="ai-agent-metrics">
                <div className="ai-agent-metric">
                    <Text type="body-small-medium" tagname="div" className="ai-agent-metric-label">Total agents</Text>
                    <Text type="heading-large-bold" tagname="div" className="ai-agent-metric-value">{metrics.total}</Text>
                </div>
                <div className="ai-agent-metric">
                    <Text type="body-small-medium" tagname="div" className="ai-agent-metric-label">Active agents</Text>
                    <Text type="heading-large-bold" tagname="div" className="ai-agent-metric-value">{metrics.active}</Text>
                </div>
                <div className="ai-agent-metric">
                    <Text type="body-small-medium" tagname="div" className="ai-agent-metric-label">Failing runs (last 24h)</Text>
                    <Text type="heading-large-bold" tagname="div" className="ai-agent-metric-value">{metrics.failing}</Text>
                </div>
                <div className="ai-agent-metric">
                    <Text type="body-small-medium" tagname="div" className="ai-agent-metric-label">Draft agents</Text>
                    <Text type="heading-large-bold" tagname="div" className="ai-agent-metric-value">{metrics.draft}</Text>
                </div>
            </div> */}

            {/* Section header */}
            <Text type="heading-small-bold" tagname="h2">AI agents</Text>

            {/* Card view */}
            <div className="ai-agent-content">
                {controlHubAgents.length > 0 && (
                    <div className="ai-agent-section">
                        <Text type="heading-small-regular" tagname="h5" className="ai-agent-section-title">
                            Made by Control Hub
                        </Text>
                        <div className="ai-agent-cards-grid">
                            {controlHubAgents.map((agent: Agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onClick={() => handleOpenAgent(agent)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="ai-agent-section">
                    <Text type="heading-small-regular" tagname="h5" className="ai-agent-section-title">
                        Your organization
                    </Text>
                    {orgAgents.length > 0 ? (
                        <div className="ai-agent-cards-grid">
                            {orgAgents.map((agent: Agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onClick={() => handleOpenAgent(agent)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="ai-agent-empty-state">
                            <Text type="body-midsize-medium" tagname="p">
                                No agents yet. Create your first agent to get started.
                            </Text>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAgentPage;
