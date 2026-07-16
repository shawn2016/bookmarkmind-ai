// ============================================================
// CleanupTab — main cleanup center tab
// ============================================================
import React, { useEffect } from 'react';
import { useCleanupStore, registerCleanupProgressListener } from '@content/store/cleanupStore';
import { CleanupSubTabs } from './CleanupSubTabs';
import { InvalidLinksList } from './InvalidLinksList';
import { DuplicateGroups } from './DuplicateGroups';

export const CleanupTab: React.FC = () => {
  const activeCleanupTab = useCleanupStore(s => s.activeCleanupTab);

  useEffect(() => {
    // Register progress listener on mount
    registerCleanupProgressListener();
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <CleanupSubTabs />
      {activeCleanupTab === 'invalid' && <InvalidLinksList />}
      {activeCleanupTab === 'duplicates' && <DuplicateGroups />}
    </div>
  );
};

export default CleanupTab;
