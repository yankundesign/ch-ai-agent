import React, { useState, useMemo } from 'react';
import { Avatar, Text, Button, Searchfield } from '@momentum-design/components/react';
import { useNavigate } from 'react-router-dom';
import { mockAgents } from '../data/mockAgents';
import type { Agent, AgentStatus } from '../types/agent.types';
import AgentCard from '../components/agentcard/AgentCard';
import KnowledgePage from './KnowledgePage';
import './aiagentpage.css';

type TabType = 'agents' | 'knowledge' | 'runlog' | 'policies';

const AIAgentPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<TabType>('agents');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
    const navigate = useNavigate();

    // Filter agents based on search and status
    const filteredAgents = useMemo(() => {
        return mockAgents.filter((agent: Agent) => {
            const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter]);

    // Separate filtered agents by source
    const controlHubAgents = useMemo(() => 
        filteredAgents.filter((a: Agent) => a.source === 'controlHub'), 
        [filteredAgents]
    );
    
    const orgAgents = useMemo(() => 
        filteredAgents.filter((a: Agent) => a.source === 'org'), 
        [filteredAgents]
    );

    // Event handlers
    const handleTabChange = (tab: TabType) => {
        setSelectedTab(tab);
    };

    const handleOpenAgent = (agent: Agent) => {
        navigate(`/ai-agent/${agent.id}`);
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
                Skills
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
            case 'runlog': return 'Run Log';
            case 'policies': return 'Policies & Guardrails';
            default: return '';
        }
    };

    // Main agents tab content
    return (
        <div className="ai-agent-page-wrapper">
            <div className="ai-agent-page-header">
                <div className="ai-agent-page-left-section">
                    <Avatar size={64} iconName='bot-regular'></Avatar>
                </div>
                <div className="ai-agent-page-middle-section">
                    <div className="ai-agent-page-middle-section-first-line">
                        <Text type="heading-midsize-bold" tagname='span'>Control hub agent</Text>
                    </div>
                    <div className="ai-agent-page-middle-section-second-line">
                        <Text type="body-midsize-medium" tagname='span'>AI Agent workspace</Text>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {renderTabs()}

            {/* Conditional content based on selected tab */}
            {selectedTab === 'knowledge' && <KnowledgePage />}

            {(selectedTab === 'runlog' || selectedTab === 'policies') && (
                <div className="ai-agent-placeholder">
                    <Text type="heading-small-bold" tagname="h2">
                        {getPlaceholderTitle()}
                    </Text>
                    <Text type="body-midsize-medium" tagname="p">
                        This section is coming soon.
                    </Text>
                </div>
            )}

            {selectedTab === 'agents' && (
                <>
                    {/* Section header with toolbar */}
                    <div className="ai-agent-header-row">
                        <Text type="heading-small-bold" tagname="h2">Skills</Text>
                        <div className="ai-agent-toolbar">
                            {/* Search input */}
                            <Searchfield 
                                className="ai-agent-searchfield" 
                                placeholder='Search'
                                value={searchTerm}
                                onInput={(e) => setSearchTerm((e as any).detail?.value || '')}
                            />
                            
                            {/* Status filter dropdown */}
                            {/* <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as AgentStatus | 'all')}
                                className="ai-agent-filter-select"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="paused">Paused</option>
                                <option value="failing">Failing</option>
                            </select> */}
                            
                            {/* Create button */}
                            <Button variant="primary" onClick={() => console.log('Create agent')}>
                                Create skill
                            </Button>
                        </div>
                    </div>

                    {/* Card view */}
                    <div className="ai-agent-content">
                        {controlHubAgents.length > 0 && (
                            <div className="ai-agent-section">
                                <Text type="heading-small-regular" tagname="h5" className="ai-agent-section-title">
                                    Default skills ({controlHubAgents.length})
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

                        <div className="ai-agent-section ai-agent-section-org">
                            <Text type="heading-small-regular" tagname="h5" className="ai-agent-section-title">
                                Custom skills ({orgAgents.length})
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
                                        {searchTerm || statusFilter !== 'all' 
                                            ? 'No agents match your search criteria.'
                                            : 'No agents yet. Create your first agent to get started.'}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIAgentPage;
