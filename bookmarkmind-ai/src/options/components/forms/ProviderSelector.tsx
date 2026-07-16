/* ============================================================
   AI 书签管家 — Provider Selector (Segmented Control)
   设计：单行分段控件，节省 ~60% 垂直空间
   选中态：琥珀底 + 深字；未选中：透明 + 弱文字
   ============================================================ */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Zap, Brain, Settings2 } from 'lucide-react';
import type { AIProvider } from '@shared/types';

interface ProviderOption {
  key: AIProvider;
  label: string;
  description: string;
  icon: LucideIcon;
}

const PROVIDERS: ProviderOption[] = [
  {
    key: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o / GPT-4o-mini 等 OpenAI 系列模型',
    icon: Zap,
  },
  {
    key: 'anthropic',
    label: 'Anthropic',
    description: 'Claude 3.5 / Haiku 系列，推荐 haiku（更快更便宜）',
    icon: Brain,
  },
  {
    key: 'custom',
    label: '自定义',
    description: '兼容 OpenAI 协议的本地或第三方 API（MiniMax / Ollama 等）',
    icon: Settings2,
  },
];

interface ProviderSelectorProps {
  value: AIProvider;
  onChange: (provider: AIProvider) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ value, onChange }) => {
  const selected = PROVIDERS.find((p) => p.key === value) ?? PROVIDERS[0];

  return (
    <div className="flex flex-col gap-bm-2">
      {/* 分段控件主体 */}
      <div
        role="radiogroup"
        aria-label="AI 服务商"
        className="flex rounded-bm-md"
        style={{
          padding: '3px',
          background: 'var(--bm-bg-elevated)',
          border: '1px solid var(--bm-border-subtle)',
          gap: '2px',
        }}
      >
        {PROVIDERS.map((p) => {
          const isSelected = value === p.key;
          const IconComp = p.icon;

          return (
            <button
              key={p.key}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(p.key)}
              className="flex items-center justify-center gap-bm-2 rounded-bm-sm outline-none"
              style={{
                flex: 1,
                height: '34px',
                padding: '0 12px',
                fontSize: 'var(--bm-text-sm)',
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--bm-text-on-accent)' : 'var(--bm-text-secondary)',
                background: isSelected
                  ? 'linear-gradient(135deg, var(--bm-amber-500) 0%, var(--bm-primary-500) 100%)'
                  : 'transparent',
                border: 'none',
                boxShadow: isSelected
                  ? '0 1px 3px rgba(200,148,90,0.30), 0 0 0 1px rgba(200,148,90,0.20)'
                  : 'none',
                transition:
                  'background .18s var(--bm-ease-out), color .18s var(--bm-ease-out), transform .32s var(--bm-ease-spring)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--bm-bg-overlay)';
                  e.currentTarget.style.color = 'var(--bm-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--bm-text-secondary)';
                }
              }}
              onMouseDown={(e) => {
                if (!isSelected) e.currentTarget.style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = isSelected
                  ? '0 1px 3px rgba(200,148,90,0.30), 0 0 0 1px rgba(200,148,90,0.20), 0 0 0 3px rgba(200,148,90,0.15)'
                  : 'var(--bm-shadow-focus)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = isSelected
                  ? '0 1px 3px rgba(200,148,90,0.30), 0 0 0 1px rgba(200,148,90,0.20)'
                  : 'none';
              }}
              data-testid={`provider-${p.key}`}
            >
              <IconComp size={14} strokeWidth={2.2} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* 当前选中的描述 — 一行小字，避免重复 */}
      <p
        style={{
          fontSize: 'var(--bm-text-xs)',
          color: 'var(--bm-text-muted)',
          lineHeight: 'var(--bm-leading-snug)',
          fontFamily: 'var(--bm-font-display)',
          fontStyle: 'italic',
          letterSpacing: 'var(--bm-tracking-tight)',
          margin: 0,
        }}
      >
        {selected.description}
      </p>
    </div>
  );
};

export default ProviderSelector;