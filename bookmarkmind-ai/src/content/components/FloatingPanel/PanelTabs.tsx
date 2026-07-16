// ============================================================
// PanelTabs — tab bar for all views (5 tabs)
// ============================================================

import React, { useCallback } from 'react';
import { MessageSquare, Bookmark, Clock, Trash2, Sparkles } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';
import type { ActiveView } from '@shared/types';

interface TabDef {
  key: ActiveView;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  disabledReason?: string;
}

const tabs: TabDef[] = [
  { key: 'chat', label: '对话', icon: <MessageSquare size={16} />, enabled: true },
  { key: 'bookmarks', label: '书签', icon: <Bookmark size={16} />, enabled: true },
  { key: 'timeline', label: '时间轴', icon: <Clock size={16} />, enabled: true },
  { key: 'cleanup', label: '清理', icon: <Trash2 size={16} />, enabled: true },
  { key: 'resurface', label: '再发现', icon: <Sparkles size={16} />, enabled: true },
];

export const PanelTabs: React.FC = () => {
  const activeTab = useContentStore((s) => s.activeTab);
  const setActiveTab = useContentStore((s) => s.setActiveTab);
  const persistViewPreferences = useContentStore((s) => s.persistViewPreferences);

  const handleTabClick = useCallback(
    (tab: TabDef) => {
      if (!tab.enabled) return;
      setActiveTab(tab.key);
      persistViewPreferences();
    },
    [setActiveTab, persistViewPreferences],
  );

  const barStyle: React.CSSProperties = {
    height: '40px',
    minHeight: '40px',
    display: 'flex',
    borderBottom: '1px solid var(--bm-gray-200)',
    backgroundColor: 'var(--bm-gray-0)',
    overflowX: 'auto',
    scrollbarWidth: 'none', // Firefox
  };

  const getTabStyle = useCallback(
    (tab: TabDef): React.CSSProperties => {
      const isActive = activeTab === tab.key;
      const isDisabled = !tab.enabled;
      return {
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--bm-space-1)',
        padding: '0 var(--bm-space-3)',
        border: 'none',
        background: 'transparent',
        fontSize: 'var(--bm-text-sm)',
        fontWeight: 500,
        color: isDisabled
          ? 'var(--bm-gray-300)'
          : isActive
            ? 'var(--bm-primary-500)'
            : 'var(--bm-gray-500)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        borderBottom: isActive && !isDisabled
          ? '2px solid var(--bm-primary-500)'
          : '2px solid transparent',
        transition:
          'color var(--bm-duration-fast), border-color var(--bm-duration-fast), background var(--bm-duration-fast)',
        marginBottom: '-1px',
        position: 'relative' as const,
      };
    },
    [activeTab],
  );

  return (
    <div style={barStyle} role="tablist" aria-label="功能区">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          style={getTabStyle(tab)}
          onClick={() => handleTabClick(tab)}
          onMouseEnter={(e) => {
            if (tab.enabled && activeTab !== tab.key) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--bm-gray-100)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }}
          role="tab"
          aria-selected={activeTab === tab.key}
          aria-label={tab.disabledReason ? `${tab.label} (${tab.disabledReason})` : tab.label}
          aria-disabled={!tab.enabled}
          title={tab.disabledReason}
          data-testid={`panel-tab-${tab.key}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default PanelTabs;
