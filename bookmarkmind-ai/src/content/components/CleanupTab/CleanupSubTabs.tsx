// ============================================================
// CleanupSubTabs — sub-tab navigation within cleanup center
// ============================================================
import React from 'react';
import { Link2, Copy } from 'lucide-react';
import { useCleanupStore } from '@content/store/cleanupStore';

interface SubTab {
  key: 'invalid' | 'duplicates';
  label: string;
  icon: React.ReactNode;
}

const subTabs: SubTab[] = [
  { key: 'invalid', label: '失效链接', icon: <Link2 size={14} /> },
  { key: 'duplicates', label: '重复书签', icon: <Copy size={14} /> },
];

export const CleanupSubTabs: React.FC = () => {
  const activeCleanupTab = useCleanupStore(s => s.activeCleanupTab);
  const setActiveCleanupTab = useCleanupStore(s => s.setActiveCleanupTab);

  const barStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid var(--bm-gray-200)',
    backgroundColor: 'var(--bm-gray-0)',
    padding: '0 var(--bm-space-3)',
    gap: 'var(--bm-space-1)',
  };

  const getTabStyle = (tab: SubTab): React.CSSProperties => {
    const isActive = activeCleanupTab === tab.key;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--bm-space-1)',
      padding: 'var(--bm-space-2) var(--bm-space-3)',
      border: 'none',
      background: 'transparent',
      fontSize: 'var(--bm-text-sm)',
      fontWeight: 500,
      color: isActive ? 'var(--bm-primary-500)' : 'var(--bm-gray-500)',
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid var(--bm-primary-500)' : '2px solid transparent',
      transition: 'color var(--bm-duration-fast), border-color var(--bm-duration-fast)',
      marginBottom: '-1px',
    };
  };

  return (
    <div style={barStyle} role="tablist" aria-label="清理中心功能">
      {subTabs.map(tab => (
        <button
          key={tab.key}
          style={getTabStyle(tab)}
          onClick={() => setActiveCleanupTab(tab.key)}
          role="tab"
          aria-selected={activeCleanupTab === tab.key}
          aria-label={tab.label}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CleanupSubTabs;
