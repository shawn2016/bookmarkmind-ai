/* ============================================================
   AI 书签管家 — Model Selector
   测试连接后从下拉列表选择模型，也支持手动输入
   ============================================================ */

import React, { useMemo, useState } from 'react';
import { ChevronDown, PenLine } from 'lucide-react';

interface ModelSelectorProps {
  value: string;
  models: string[];
  placeholder?: string;
  onChange: (model: string) => void;
}

const inputBaseStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-md)',
  padding: '8px 12px',
  border: '1px solid var(--bm-border-strong)',
  background: 'var(--bm-bg-input)',
  color: 'var(--bm-text-primary)',
  transition: 'border-color var(--bm-duration-fast) var(--bm-ease-default)',
};

const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  models,
  placeholder,
  onChange,
}) => {
  const [manualMode, setManualMode] = useState(false);

  const options = useMemo(() => {
    if (!value) return models;
    return models.includes(value) ? models : [value, ...models];
  }, [models, value]);

  const canSelect = models.length > 0 && !manualMode;

  return (
    <div className="flex flex-col gap-bm-2">
      {canSelect ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-bm-md outline-none appearance-none"
            style={{
              ...inputBaseStyle,
              paddingRight: '36px',
              cursor: 'pointer',
            }}
            aria-label="选择模型"
            data-testid="model-select"
          >
            {!value && (
              <option value="" disabled>
                请选择模型
              </option>
            )}
            {options.map((modelId) => (
              <option key={modelId} value={modelId}>
                {modelId}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--bm-text-muted)',
              pointerEvents: 'none',
            }}
          />
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-bm-md outline-none"
          style={inputBaseStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--bm-border-accent)';
            e.currentTarget.style.boxShadow = 'var(--bm-shadow-focus)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--bm-border-strong)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="模型名称"
          data-testid="model-input"
        />
      )}

      {models.length > 0 && (
        <button
          type="button"
          onClick={() => setManualMode((v) => !v)}
          className="flex items-center gap-bm-1 self-start rounded-bm-sm outline-none"
          style={{
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-accent)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 0',
          }}
        >
          <PenLine size={12} />
          {canSelect ? '手动输入模型 ID' : `从列表选择（${models.length} 个）`}
        </button>
      )}

      {canSelect && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-muted)',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
          }}
        >
          已从服务商获取 {models.length} 个可用模型，可直接选择
        </p>
      )}
    </div>
  );
};

export default ModelSelector;
