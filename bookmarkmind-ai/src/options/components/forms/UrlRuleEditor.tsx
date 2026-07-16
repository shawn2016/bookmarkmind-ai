/* ============================================================
   AI 书签管家 — URL Pattern Rule Editor
   ============================================================ */

import React, { useCallback } from 'react';
import { X, Plus } from 'lucide-react';

interface UrlRuleEditorProps {
  rules: string[];
  onChange: (rules: string[]) => void;
}

const UrlRuleEditor: React.FC<UrlRuleEditorProps> = ({ rules, onChange }) => {
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
      const next = rules.filter((_, i) => i !== index);
      onChange(next);
    },
    [rules, onChange],
  );

  const handleAddRule = useCallback(() => {
    onChange([...rules, '']);
  }, [rules, onChange]);

  return (
    <div className="flex flex-col gap-bm-2">
      {rules.map((rule, index) => (
        <div key={index} className="flex items-center gap-bm-2">
          <input
            type="text"
            value={rule}
            onChange={(e) => handleRuleChange(index, e.target.value)}
            placeholder="*://*.example.com/*"
            className="flex-1 rounded-bm-md outline-none"
            style={{
              fontSize: 'var(--bm-text-sm)',
              padding: '6px 12px',
              border: '1px solid var(--bm-gray-200)',
              background: 'var(--bm-gray-0)',
              color: 'var(--bm-gray-800)',
              transition: 'border-color var(--bm-duration-fast) var(--bm-ease-default)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--bm-primary-500)';
              e.currentTarget.style.boxShadow = 'var(--bm-shadow-focus)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bm-gray-200)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={() => handleDeleteRule(index)}
            className="p-1 rounded-bm-sm outline-none"
            style={{
              color: 'var(--bm-gray-400)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition:
                'color var(--bm-duration-fast) var(--bm-ease-default), background var(--bm-duration-fast) var(--bm-ease-default)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--bm-error-500)';
              e.currentTarget.style.background = 'var(--bm-error-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--bm-gray-400)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="删除此规则"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ))}

      <button
        onClick={handleAddRule}
        className="flex items-center gap-bm-1 rounded-bm-md outline-none"
        style={{
          fontSize: 'var(--bm-text-sm)',
          padding: '6px 12px',
          color: 'var(--bm-primary-500)',
          background: 'var(--bm-primary-50)',
          border: '1px solid var(--bm-primary-100)',
          cursor: 'pointer',
          fontWeight: 500,
          transition:
            'background .22s var(--bm-ease-out), transform .32s var(--bm-ease-spring)',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.97)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Plus size={14} strokeWidth={2} />
        <span>添加规则</span>
      </button>

      <p
        style={{
          fontSize: 'var(--bm-text-xs)',
          color: 'var(--bm-gray-400)',
          marginTop: '2px',
        }}
      >
        支持 Chrome URL 匹配模式，如 *://*.alipay.com/* — 在匹配的网站上悬浮球不会显示
      </p>
    </div>
  );
};

export default UrlRuleEditor;
