import React from 'react';
import { Button } from '@momentum-design/components/react';
import './tabs.css';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  size?: 'small' | 'medium' | 'large';
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onTabChange, size = 'medium' }) => {
  return (
    <div className={`tabs-container tabs-${size}`}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="secondary"
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTabId === tab.id ? 'tab-active' : ''}`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default Tabs;

