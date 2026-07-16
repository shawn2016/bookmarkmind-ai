/* ============================================================
   AI 书签管家 — API Key Input (password with show/hide toggle)
   ============================================================ */

import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ value, onChange, placeholder }) => {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleVisibility = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in some contexts; ignore silently
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'sk-...'}
        className="w-full rounded-bm-md outline-none"
        style={{
          fontSize: 'var(--bm-text-md)',
          padding: '8px 80px 8px 12px',
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

      {/* Toggle visibility button */}
      <button
        onClick={handleToggleVisibility}
        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 outline-none"
        style={{
          color: 'var(--bm-gray-400)',
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
        }}
        title={visible ? '隐藏' : '显示'}
      >
        {visible ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
      </button>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 outline-none"
        style={{
          color: copied ? 'var(--bm-success-500)' : 'var(--bm-gray-400)',
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          transition: 'color var(--bm-duration-fast) var(--bm-ease-default)',
        }}
        title="复制"
      >
        {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={2} />}
      </button>
    </div>
  );
};

export default ApiKeyInput;
