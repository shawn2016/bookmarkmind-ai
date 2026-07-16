/* ============================================================
   AI 书签管家 — Options Sidebar Navigation
   设计：active 项 4px 琥珀左竖条 + 图标琥珀金 + hover 微 inset
   ============================================================ */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Cpu,
  Circle,
  FolderTree,
  Tags,
  Bell,
  Palette,
  Database,
  Sparkles,
  Info,
} from 'lucide-react';
import { useOptionsStore } from '../store/optionsStore';
import type { SectionKey } from '../store/optionsStore';

interface NavItemDef {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItemDef[] = [
  { key: 'model', label: '模型配置', icon: Cpu },
  { key: 'ball', label: '悬浮球设置', icon: Circle },
  { key: 'category', label: '书签管理', icon: FolderTree },
  { key: 'tags', label: '标签管理', icon: Tags },
  { key: 'notification', label: '通知设置', icon: Bell },
  { key: 'personalization', label: '个性化', icon: Palette },
  { key: 'resurface', label: '再发现推送', icon: Sparkles },
  { key: 'data', label: '数据管理', icon: Database },
  { key: 'about', label: '关于', icon: Info },
];

const OptionsSidebar: React.FC = () => {
  const { activeSection, setActiveSection } = useOptionsStore();

  return (
    <nav
      className="flex flex-col py-bm-4 px-bm-2 overflow-y-auto"
      style={{
        position: 'relative',
        width: '220px',
        borderRight: '1px solid var(--bm-border-subtle)',
        background:
          'linear-gradient(180deg, var(--bm-accent-04) 0%, transparent 24%, transparent 100%), var(--bm-bg-elevated)',
        flexShrink: 0,
      }}
      aria-label="主导航"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.key;
        const IconComp = item.icon;

        return (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            aria-current={isActive ? 'page' : undefined}
            className="flex items-center gap-bm-3 text-left outline-none"
            style={{
              position: 'relative',
              height: '40px',
              padding: '0 14px 0 22px',
              marginBottom: '2px',
              fontSize: 'var(--bm-text-md)',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--bm-text-heading)' : 'var(--bm-text-secondary)',
              background: isActive
                ? 'linear-gradient(90deg, var(--bm-accent-10) 0%, transparent 60%)'
                : 'transparent',
              borderRadius: 'var(--bm-radius-sm)',
              border: 'none',
              transition:
                'background .18s var(--bm-ease-out), color .18s var(--bm-ease-out), transform .32s var(--bm-ease-spring)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--bm-accent-04)';
                e.currentTarget.style.color = 'var(--bm-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--bm-text-secondary)';
              }
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.985)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = 'var(--bm-shadow-focus)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* 4px 琥珀左竖条 — active 的视觉锚点，灯下暖光的"书签带" */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: '6px',
                top: '6px',
                bottom: '6px',
                width: '4px',
                borderRadius: '3px',
                background: isActive ? 'var(--bm-amber-500)' : 'transparent',
                boxShadow: isActive
                  ? '0 0 8px var(--bm-accent-55), 0 0 0 1px var(--bm-accent-20)'
                  : 'none',
                transition: 'background .18s var(--bm-ease-out), box-shadow .22s var(--bm-ease-out)',
              }}
            />

            <IconComp
              size={17}
              strokeWidth={isActive ? 2.4 : 2}
              style={{
                color: isActive ? 'var(--bm-amber-500)' : 'var(--bm-text-muted)',
                transition: 'color .18s var(--bm-ease-out), stroke-width .18s var(--bm-ease-out)',
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default OptionsSidebar;