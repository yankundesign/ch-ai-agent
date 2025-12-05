import React, { useState } from 'react';
import { Icon, Text, Chip, Button } from '@momentum-design/components/react';
import type { KnowledgeItem } from '../../types/knowledge.types';
import { getTypeIcon, getStatusLabel, formatLastUpdated } from '../../utils/knowledgeHelpers';
import './knowledgetable.css';

interface KnowledgeTableProps {
  items: KnowledgeItem[];
  onAction: (item: KnowledgeItem, action: string) => void;
}

export const KnowledgeTable: React.FC<KnowledgeTableProps> = ({ items, onAction }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (itemId: string) => {
    setActiveMenu(activeMenu === itemId ? null : itemId);
  };

  const handleAction = (item: KnowledgeItem, action: string) => {
    setActiveMenu(null);
    onAction(item, action);
  };

  return (
    <div className="knowledge-table-wrapper">
      <table className="knowledge-table">
        <thead>
          <tr>
            <th><Text type="body-small-bold" tagname="span">Name</Text></th>
            <th><Text type="body-small-bold" tagname="span">Type</Text></th>
            <th><Text type="body-small-bold" tagname="span">Status</Text></th>
            <th><Text type="body-small-bold" tagname="span">Used By</Text></th>
            <th><Text type="body-small-bold" tagname="span">Last Updated</Text></th>
            <th className="knowledge-table-actions-header"><Text type="body-small-bold" tagname="span">Actions</Text></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="knowledge-table-row">
              <td className="knowledge-table-name-cell">
                <div className="knowledge-table-name">
                  <Icon name={getTypeIcon(item.type)} size={16} />
                  <Text type="body-midsize-medium" tagname="span">
                    {item.name}
                  </Text>
                </div>
              </td>
              <td>
                <Text type="body-midsize-medium" tagname="span">
                  {item.type}
                </Text>
              </td>
              <td>
                <Chip 
                  label={getStatusLabel(item.status)} 
                  size={24}
                  className={`knowledge-status-chip knowledge-status-${item.status}`}
                />
              </td>
              <td>
                <Text type="body-midsize-medium" tagname="span">
                  {item.linkedAgents} {item.linkedAgents === 1 ? 'agent' : 'agents'}
                </Text>
              </td>
              <td>
                <Text type="body-small-medium" tagname="span" className="knowledge-table-date">
                  {formatLastUpdated(item.lastUpdated)}
                </Text>
              </td>
              <td className="knowledge-table-actions-cell">
                <div className="knowledge-table-actions">
                  <Button
                    variant="tertiary"
                    size={32}
                    prefixIcon="more-regular"
                    aria-label="Actions menu"
                    onClick={() => toggleMenu(item.id)}
                  />
                  {activeMenu === item.id && (
                    <div className="knowledge-table-menu">
                      <Button
                        className="knowledge-table-menu-item"
                        variant="tertiary"
                        prefixIcon="edit-regular"
                        onClick={() => handleAction(item, 'edit')}
                      >
                        Edit
                      </Button>
                      <Button
                        className="knowledge-table-menu-item"
                        variant="tertiary"
                        prefixIcon="recents-regular"
                        onClick={() => handleAction(item, 'resync')}
                      >
                        Re-sync
                      </Button>
                      <Button
                        className="knowledge-table-menu-item knowledge-table-menu-item-danger"
                        variant="tertiary"
                        prefixIcon="delete-regular"
                        onClick={() => handleAction(item, 'delete')}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

