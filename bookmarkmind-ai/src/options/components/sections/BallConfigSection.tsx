/* ============================================================
   AI 书签管家 — Floating Ball Configuration Section
   使用 primitives: SectionCard, SubSection, Field, Toggle/ToggleRow,
   Segmented, Slider, Button
   ============================================================ */

import React, { useCallback } from 'react';
import {
  MonitorPlay,
  Keyboard,
  Globe,
  Plus,
  CircleDot,
} from 'lucide-react';
import { useOptionsStore } from '@options/store/optionsStore';
import type { BallSide, ActionBarMode, ClickBehavior } from '@shared/types';
import { BALL_SIZE_MIN, BALL_SIZE_MAX } from '@shared/utils/ball-size';
import { formatSiteRuleLabel } from '@shared/utils/url-match';
import {
  SectionCard,
  SubSection,
  Field,
  ToggleRow,
  Segmented,
  Slider,
} from '../primitives';

/* ============================================================
   UrlRuleList — 卡内列表容器（仍保留在这里，因为带特色 UI）
   ============================================================ */
const UrlRuleList: React.FC<{
  rules: string[];
  onChange: (rules: string[]) => void;
}> = ({ rules, onChange }) => {
  const handleRuleChange = useCallback(
    (index: number, value: string) => {
      const next = [...rules];
      next[index] = value;
      onChange(next);
    },
    [rules, onChange],
  );

  const handleDeleteRule = useCallback(
    (index: number) => {
      onChange(rules.filter((_, i) => i !== index));
    },
    [rules, onChange],
  );

  const handleAddRule = useCallback(() => {
    onChange([...rules, '']);
  }, [rules, onChange]);

  return (
    <div className="flex flex-col gap-bm-2">
      <div
        className="rounded-bm-md overflow-hidden"
        style={{
          background: 'var(--bm-bg-elevated)',
          border: '1px solid var(--bm-border-subtle)',
        }}
      >
        {rules.length === 0 ? (
          <div
            className="flex items-center justify-center gap-bm-2"
            style={{
              padding: '20px 16px',
              fontSize: 'var(--bm-text-sm)',
              color: 'var(--bm-text-muted)',
              fontFamily: 'var(--bm-font-display)',
              fontStyle: 'italic',
            }}
          >
            <Globe size={14} strokeWidth={2} style={{ opacity: 0.5 }} />
            暂无永久隐藏记录 — 悬浮球会在所有网站上显示
          </div>
        ) : (
          rules.map((rule, index) => (
            <div
              key={index}
              className="flex items-center gap-bm-3"
              style={{
                padding: '8px 12px',
                borderBottom:
                  index < rules.length - 1
                    ? '1px solid var(--bm-border-subtle)'
                    : 'none',
                transition: 'background .18s var(--bm-ease-out)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(200,148,90,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span
                className="rounded-bm-sm flex items-center justify-center flex-shrink-0"
                style={{
                  width: '22px',
                  height: '22px',
                  fontSize: '10px',
                  fontWeight: 600,
                  fontFamily: 'var(--bm-font-mono)',
                  color: 'var(--bm-text-muted)',
                  background: 'var(--bm-bg-input)',
                  border: '1px solid var(--bm-border-subtle)',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: 'var(--bm-text-sm)',
                    fontWeight: 500,
                    color: 'var(--bm-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatSiteRuleLabel(rule) || '未命名站点'}
                </div>
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  placeholder="*://*.example.com/*"
                  className="w-full rounded-bm-sm outline-none"
                  style={{
                    fontSize: 'var(--bm-text-xs)',
                    fontFamily: 'var(--bm-font-mono)',
                    padding: '3px 0',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--bm-text-muted)',
                    letterSpacing: '0.02em',
                  }}
                  aria-label={`规则 ${index + 1}`}
                />
              </div>
              <button
                onClick={() => handleDeleteRule(index)}
                className="rounded-bm-sm outline-none flex items-center justify-center flex-shrink-0"
                style={{
                  width: '24px',
                  height: '24px',
                  color: 'var(--bm-text-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--bm-duration-fast) var(--bm-ease-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--bm-state-error)';
                  e.currentTarget.style.background = 'rgba(224,133,133,0.10)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--bm-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="恢复显示（删除此记录）"
                aria-label={`恢复 ${formatSiteRuleLabel(rule)} 显示`}
              >
                <Plus size={14} strokeWidth={2} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleAddRule}
        className="flex items-center gap-bm-2 rounded-bm-md outline-none self-start"
        style={{
          fontSize: 'var(--bm-text-sm)',
          padding: '6px 12px',
          color: 'var(--bm-text-accent)',
          background: 'transparent',
          border: '1px dashed var(--bm-border-accent)',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'all .22s var(--bm-ease-out)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(200,148,90,0.06)';
          e.currentTarget.style.borderColor = 'var(--bm-amber-500)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--bm-border-accent)';
        }}
      >
        <Plus size={14} strokeWidth={2.4} />
        <span>手动添加网站</span>
      </button>

      <p
        className="flex items-start gap-bm-2"
        style={{
          fontSize: 'var(--bm-text-xs)',
          color: 'var(--bm-text-muted)',
          lineHeight: 'var(--bm-leading-relaxed)',
          fontFamily: 'var(--bm-font-display)',
          fontStyle: 'italic',
          letterSpacing: 'var(--bm-tracking-tight)',
          padding: '6px 10px',
          borderLeft: '2px solid var(--bm-border-subtle)',
          margin: 0,
        }}
      >
        <CircleDot size={11} strokeWidth={2.4} style={{ marginTop: '3px', flexShrink: 0, opacity: 0.6 }} />
        在网页上选择「在此网站永久隐藏」会自动记录在此。删除记录即可恢复显示。支持
        <code
          style={{
            fontFamily: 'var(--bm-font-mono)',
            fontSize: '10px',
            padding: '1px 4px',
            background: 'var(--bm-bg-elevated)',
            borderRadius: '3px',
            color: 'var(--bm-text-primary)',
          }}
        >
          *://*.example.com/*
        </code>
        等 Chrome URL 匹配模式
      </p>
    </div>
  );
};

/* ============================================================
   Constants
   ============================================================ */
const SIDE_OPTIONS: ReadonlyArray<{ value: BallSide; label: string }> = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
];

const ACTION_BAR_OPTIONS: ReadonlyArray<{ value: ActionBarMode; label: string }> = [
  { value: 'hidden', label: '隐藏' },
  { value: 'hover', label: '悬停时' },
  { value: 'always', label: '常驻' },
];

const CLICK_BEHAVIOR_OPTIONS: ReadonlyArray<{ value: ClickBehavior; label: string }> = [
  { value: 'expand', label: '展开面板' },
  { value: 'bookmark', label: '收藏当前页' },
  { value: 'search', label: 'AI 对话' },
];

/* ============================================================
   BallConfigSection
   ============================================================ */
const BallConfigSection: React.FC = () => {
  const { config, setBallConfig } = useOptionsStore();
  const { ball } = config;
  const ballSize = ball.size ?? 48;

  return (
    <SectionCard
      title="悬浮球设置"
      subtitle="控制悬浮球在网页上的显示位置、大小和交互行为"
    >
      {/* 显示 */}
      <SubSection icon={<CircleDot size={15} strokeWidth={2.2} />} title="显示" caption="屏幕 · 视觉">
        <ToggleRow
          title="启用悬浮球"
          description={ball.enabled ? '在所有匹配的页面上显示' : '当前已禁用 — 仅在数据页内可用'}
          checked={ball.enabled}
          onChange={(v) => setBallConfig({ enabled: v })}
          ariaLabel="启用悬浮球"
        />

        <Field label="位置" description="悬浮球默认出现在屏幕的哪一侧">
          <Segmented<BallSide>
            options={SIDE_OPTIONS}
            value={ball.side}
            onChange={(v) => setBallConfig({ side: v })}
            ariaLabel="悬浮球位置"
          />
        </Field>

        <Field label="大小" description={`直径 ${ballSize}px · 拖动调整`}>
          <Slider
            value={ballSize}
            min={BALL_SIZE_MIN}
            max={BALL_SIZE_MAX}
            step={2}
            onChange={(v) => setBallConfig({ size: v })}
            formatValue={(v) => `${v}px`}
            minLabel={`${BALL_SIZE_MIN}px`}
            maxLabel={`${BALL_SIZE_MAX}px`}
            ariaLabel="悬浮球大小"
          />
        </Field>

        <Field label="透明度" description={`当前 ${ball.opacity}% — 越高越不透明`}>
          <Slider
            value={ball.opacity}
            min={20}
            max={100}
            step={5}
            onChange={(v) => setBallConfig({ opacity: v })}
            formatValue={(v) => `${v}%`}
            minLabel="20%"
            maxLabel="100%"
            ariaLabel="悬浮球透明度"
          />
        </Field>
      </SubSection>

      {/* 交互 */}
      <SubSection icon={<MonitorPlay size={15} strokeWidth={2.2} />} title="交互" caption="点击 · 行为">
        <Field label="操作栏显示方式" description="悬浮球旁边的操作栏何时出现">
          <Segmented<ActionBarMode>
            options={ACTION_BAR_OPTIONS}
            value={ball.actionBarMode}
            onChange={(v) => setBallConfig({ actionBarMode: v })}
            ariaLabel="操作栏显示方式"
          />
        </Field>

        <Field label="点击行为" description="点击悬浮球时的默认行为">
          <Segmented<ClickBehavior>
            options={CLICK_BEHAVIOR_OPTIONS}
            value={ball.clickBehavior}
            onChange={(v) => setBallConfig({ clickBehavior: v })}
            ariaLabel="点击行为"
          />
        </Field>

        <ToggleRow
          icon={<MonitorPlay size={14} strokeWidth={2} />}
          title="全屏时自动隐藏"
          description="检测到全屏或视频播放时，悬浮球自动消失避免遮挡"
          checked={ball.autoHideFullscreen}
          onChange={(v) => setBallConfig({ autoHideFullscreen: v })}
          ariaLabel="全屏自动隐藏"
        />
      </SubSection>

      {/* 快捷键 */}
      <SubSection icon={<Keyboard size={15} strokeWidth={2.2} />} title="快捷键" caption="F · 全屏">
        <ToggleRow
          icon={<Keyboard size={14} strokeWidth={2} />}
          title="启用 F 键切换全屏"
          description="面板打开时按 F 进入全屏 · 按 Esc 退出"
          checked={ball.panelShortcutEnabled}
          onChange={(v) => setBallConfig({ panelShortcutEnabled: v })}
          ariaLabel="启用 F 键切换全屏"
        />
      </SubSection>

      {/* 永久隐藏 */}
      <SubSection
        icon={<Globe size={15} strokeWidth={2.2} />}
        title="永久隐藏的网站"
        caption={`${ball.disabledSites.length} 个`}
      >
        <UrlRuleList
          rules={ball.disabledSites}
          onChange={(rules) => setBallConfig({ disabledSites: rules })}
        />
      </SubSection>
    </SectionCard>
  );
};

export default BallConfigSection;