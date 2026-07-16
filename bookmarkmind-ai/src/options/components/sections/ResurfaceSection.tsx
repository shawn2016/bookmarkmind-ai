/* ============================================================
   AI 书签管家 — Resurface Settings Section
   使用 primitives: SectionCard, SubSection, Field, ToggleRow, Slider, Select
   ============================================================ */

import React, { useEffect, useState } from 'react';
import type { ResurfacePrefs } from '@shared/types';
import { DEFAULT_RESURFACE_PREFS } from '@shared/types';
import { Sparkles, Clock, Hash, Zap, Info } from 'lucide-react';
import {
  SectionCard,
  SubSection,
  Field,
  ToggleRow,
  Slider,
} from '../primitives';

const FREQ_OPTIONS: ReadonlyArray<{
  value: ResurfacePrefs['frequency'];
  label: string;
}> = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'disabled', label: '禁用' },
];

const ResurfaceSection: React.FC = () => {
  const [prefs, setPrefs] = useState<ResurfacePrefs>(DEFAULT_RESURFACE_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'RESURFACE_GET_PREFS' });
      if (response?.prefs) {
        setPrefs({ ...DEFAULT_RESURFACE_PREFS, ...response.prefs });
      }
    } catch {
      /* 使用默认值 */
    }
  };

  const savePrefs = async (partial: Partial<ResurfacePrefs>) => {
    setSaving(true);
    const updated = { ...prefs, ...partial };
    setPrefs(updated);
    try {
      await chrome.runtime.sendMessage({
        type: 'RESURFACE_SET_PREFS',
        payload: partial,
      });
    } catch {
      /* silent */
    }
    setSaving(false);
  };

  return (
    <SectionCard
      title="再发现推送"
      subtitle="每天自动推荐你可能遗忘的老书签，让知识重新浮现"
    >
      {/* 总开关 */}
      <SubSection
        icon={<Sparkles size={15} strokeWidth={2.2} />}
        title="推送"
        caption={prefs.enabled ? '已开启' : '已关闭'}
      >
        <ToggleRow
          icon={<Zap size={14} strokeWidth={2} />}
          title="推送总开关"
          description={
            prefs.enabled
              ? '已开启再发现推送'
              : '已关闭再发现推送 — 不会发送通知'
          }
          checked={prefs.enabled}
          onChange={(v) => savePrefs({ enabled: v })}
          ariaLabel="推送总开关"
        />

        {prefs.enabled && (
          <>
            <Field label="推送频率" description="推荐节奏，影响总数量">
              <div
                role="radiogroup"
                aria-label="推送频率"
                className="flex rounded-bm-md"
                style={{
                  padding: '3px',
                  background: 'var(--bm-bg-elevated)',
                  border: '1px solid var(--bm-border-subtle)',
                  gap: '2px',
                }}
              >
                {FREQ_OPTIONS.map((opt) => {
                  const selected = prefs.frequency === opt.value;
                  return (
                    <button
                      key={opt.value}
                      role="radio"
                      aria-checked={selected}
                      onClick={() =>
                        savePrefs({ frequency: opt.value as ResurfacePrefs['frequency'] })
                      }
                      className="flex-1 rounded-bm-sm outline-none"
                      style={{
                        padding: selected ? '5px 12px' : '6px 12px',
                        fontSize: 'var(--bm-text-sm)',
                        fontWeight: selected ? 600 : 400,
                        color: selected
                          ? 'var(--bm-text-on-accent)'
                          : 'var(--bm-text-secondary)',
                        background: selected
                          ? 'linear-gradient(180deg, var(--bm-amber-500) 0%, var(--bm-primary-500) 100%)'
                          : 'transparent',
                        border: 'none',
                        boxShadow: selected
                          ? 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 2px rgba(0,0,0,0.18), 0 1px 3px rgba(200,148,90,0.25)'
                          : 'none',
                        cursor: 'pointer',
                        transition:
                          'background .18s var(--bm-ease-out), color .18s var(--bm-ease-out), padding .18s var(--bm-ease-out)',
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) {
                          e.currentTarget.style.background = 'var(--bm-bg-overlay)';
                          e.currentTarget.style.color = 'var(--bm-text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--bm-text-secondary)';
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            {prefs.frequency !== 'disabled' && (
              <Field label="推送时间" description="每天在此时间收到再发现推送通知">
                <div className="flex items-center gap-bm-2">
                  <Clock size={14} strokeWidth={2} style={{ color: 'var(--bm-text-accent)' }} />
                  <input
                    type="time"
                    value={prefs.pushTime}
                    onChange={(e) => savePrefs({ pushTime: e.target.value })}
                    className="rounded-bm-sm outline-none"
                    style={{
                      fontSize: 'var(--bm-text-sm)',
                      fontFamily: 'var(--bm-font-mono)',
                      padding: '6px 10px',
                      border: '1px solid var(--bm-border-strong)',
                      background: 'var(--bm-bg-input)',
                      color: 'var(--bm-text-primary)',
                    }}
                  />
                </div>
              </Field>
            )}

            <Field label="每次推送数量" description="3–10 条书签推荐">
              <Slider
                value={prefs.count}
                min={3}
                max={10}
                step={1}
                onChange={(v) => savePrefs({ count: v })}
                formatValue={(v) => `${v} 条`}
                minLabel="3"
                maxLabel="10"
                ariaLabel="每次推送数量"
              />
            </Field>

            <ToggleRow
              icon={<Hash size={14} strokeWidth={2} />}
              title="反打扰状态"
              description={
                prefs.paused
                  ? '已自动暂停（连续多次未互动）'
                  : prefs.noActionStreak >= 3
                    ? `已连续 ${prefs.noActionStreak} 次未互动，即将降频`
                    : '正常推送中'
              }
              checked={!prefs.paused}
              onChange={(v) => savePrefs({ paused: !v })}
              ariaLabel="反打扰"
            />
          </>
        )}
      </SubSection>

      {/* 关于 */}
      <SubSection icon={<Info size={15} strokeWidth={2.2} />} title="关于再发现" caption="规则">
        <ul
          style={{
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-secondary)',
            lineHeight: 1.9,
            paddingLeft: 'var(--bm-space-5)',
            margin: 0,
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            letterSpacing: 'var(--bm-tracking-tight)',
          }}
        >
          <li>安装满 7 天后开始推送推荐书签</li>
          <li>只推荐收藏超过 30 天的书签</li>
          <li>已推荐过的书签 30 天内不会再次推荐</li>
          <li>标记"不感兴趣"的书签 90 天内不再推荐</li>
          <li>连续 3 次未互动将自动降为每周推送</li>
          <li>连续 5 次未互动将自动暂停推送</li>
        </ul>
      </SubSection>

      {saving && (
        <div
          style={{
            marginTop: '12px',
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-muted)',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            textAlign: 'right',
          }}
        >
          正在保存…
        </div>
      )}
    </SectionCard>
  );
};

export default ResurfaceSection;