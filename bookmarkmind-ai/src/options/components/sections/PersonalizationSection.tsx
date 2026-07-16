/* ============================================================
   AI 书签管家 — Personalization Settings Section
   使用 primitives: SectionCard, SubSection, Field, ToggleRow, Segmented, Callout
   ============================================================ */

import React from 'react';
import { Palette, Sparkles, Trash2, Info } from 'lucide-react';
import { useOptionsStore } from '@options/store/optionsStore';
import type { ThemeMode, Language } from '@shared/types';
import {
  SectionCard,
  SubSection,
  Field,
  ToggleRow,
  Segmented,
  Callout,
} from '../primitives';

const THEME_OPTIONS: ReadonlyArray<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
];

const LANG_OPTIONS: ReadonlyArray<{ value: Language; label: string }> = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
];

type FontSize = 'small' | 'medium' | 'large';
const FONT_OPTIONS: ReadonlyArray<{ value: FontSize; label: string }> = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
];

const PersonalizationSection: React.FC = () => {
  const { config, setAppConfig } = useOptionsStore();
  const { app } = config;

  return (
    <SectionCard
      title="个性化"
      subtitle="自定义扩展的外观、语言和行为偏好"
    >
      {/* 外观 */}
      <SubSection
        icon={<Palette size={15} strokeWidth={2.2} />}
        title="外观"
        caption="主题 · 语言 · 字号"
      >
        <Field label="主题" description="选择扩展界面的配色方案">
          <Segmented<ThemeMode>
            options={THEME_OPTIONS}
            value={app.theme}
            onChange={(v) => setAppConfig({ theme: v })}
            ariaLabel="主题"
          />
        </Field>

        <Field label="语言" description="界面显示语言">
          <Segmented<Language>
            options={LANG_OPTIONS}
            value={app.language}
            onChange={(v) => setAppConfig({ language: v })}
            ariaLabel="语言"
          />
        </Field>

        <Field label="字体大小" description="调整悬浮面板和设置页的字体大小">
          <Segmented<FontSize>
            options={FONT_OPTIONS}
            value={app.fontSize}
            onChange={(v) => setAppConfig({ fontSize: v })}
            ariaLabel="字体大小"
          />
        </Field>
      </SubSection>

      {/* 行为 */}
      <SubSection
        icon={<Sparkles size={15} strokeWidth={2.2} />}
        title="行为"
        caption="自动 · 回收"
      >
        <ToggleRow
          icon={<Sparkles size={14} strokeWidth={2} />}
          title="收藏时自动分类"
          description="收藏新书签时，AI 自动归入最合适的文件夹（优先匹配现有分类）"
          checked={app.autoClassify}
          onChange={(v) => setAppConfig({ autoClassify: v })}
          ariaLabel="收藏时自动分类"
        />

        <ToggleRow
          icon={<Trash2 size={14} strokeWidth={2} />}
          title="回收站"
          description="删除书签时移入回收站，可在数据管理中恢复"
          checked={app.recycleBinEnabled}
          onChange={(v) => setAppConfig({ recycleBinEnabled: v })}
          ariaLabel="启用回收站"
        />
      </SubSection>

      <div className="mt-bm-5">
        <Callout icon={<Info size={14} strokeWidth={2} />} tone="info">
          主题和语言设置会立即生效。字体大小调整可能需要刷新页面才能完全生效。
        </Callout>
      </div>
    </SectionCard>
  );
};

export default PersonalizationSection;