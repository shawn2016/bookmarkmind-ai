/* ============================================================
   AI 书签管家 — Options Page Root Component
   ============================================================ */

import React, { useEffect } from 'react';
import { useOptionsStore } from './store/optionsStore';
import { applyAppSettings, watchSystemTheme } from '@shared/utils/theme';
import OptionsHeader from './components/OptionsHeader';
import OptionsSidebar from './components/OptionsSidebar';
import ModelConfigSection from './components/sections/ModelConfigSection';
import BallConfigSection from './components/sections/BallConfigSection';
import CategoryManagementSection from './components/sections/CategoryManagementSection';
import TagManagementSection from './components/sections/TagManagementSection';
import NotificationSettingsSection from './components/sections/NotificationSettingsSection';
import PersonalizationSection from './components/sections/PersonalizationSection';
import DataManagementSection from './components/sections/DataManagementSection';
import ResurfaceSection from './components/sections/ResurfaceSection';
import AboutSection from './components/sections/AboutSection';
import type { SectionKey } from './store/optionsStore';

const sectionComponents: Record<SectionKey, React.FC> = {
  model: ModelConfigSection,
  ball: BallConfigSection,
  category: CategoryManagementSection,
  tags: TagManagementSection,
  notification: NotificationSettingsSection,
  personalization: PersonalizationSection,
  data: DataManagementSection,
  resurface: ResurfaceSection,
  about: AboutSection,
};

const App: React.FC = () => {
  const { activeSection, loadConfig, config } = useOptionsStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    applyAppSettings(config.app);
    watchSystemTheme(config.app);
  }, [config.app]);

  const ActiveSection = sectionComponents[activeSection];

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        fontFamily: 'var(--bm-font-sans)',
        background: 'var(--bm-bg-canvas)',
        color: 'var(--bm-text-primary)',
      }}
    >
      <OptionsHeader />
      <div className="flex flex-1 overflow-hidden">
        <OptionsSidebar />
        <main
          className="flex-1 overflow-y-auto p-bm-6 bm-scrollbar"
          style={{
            background: 'var(--bm-bg-canvas)',
            position: 'relative',
            /* 右侧 2px 琥珀 scroll indicator — 暗示可滚动 */
            backgroundImage:
              'linear-gradient(90deg, transparent calc(100% - 2px), var(--bm-accent-18) 100%)',
            backgroundAttachment: 'local',
          }}
        >
          <ActiveSection />
        </main>
      </div>
    </div>
  );
};

export default App;
