/* ============================================================
   AI 书签管家 — Connection Tester Button & Result Display
   ============================================================ */

import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useOptionsStore } from '@options/store/optionsStore';

const ConnectionTester: React.FC = () => {
  const { testing, testResult, testConnection } = useOptionsStore();

  return (
    <div className="flex flex-col gap-bm-2">
      <button
        onClick={testConnection}
        disabled={testing}
        className="flex items-center gap-bm-2 rounded-bm-md outline-none"
        style={{
          fontSize: 'var(--bm-text-md)',
          padding: '8px 16px',
          fontWeight: 500,
          color: testing ? 'var(--bm-gray-400)' : 'var(--bm-primary-500)',
          background: testing ? 'var(--bm-gray-100)' : 'var(--bm-primary-50)',
          border: `1px solid ${testing ? 'var(--bm-gray-200)' : 'var(--bm-primary-200)'}`,
          cursor: testing ? 'not-allowed' : 'pointer',
          transition:
            'background .22s var(--bm-ease-out), transform .32s var(--bm-ease-spring)',
        }}
        onMouseDown={(e) => {
          if (!testing) e.currentTarget.style.transform = 'scale(0.97)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {testing ? (
          <Loader2 size={16} strokeWidth={2} className="animate-spin" />
        ) : (
          <CheckCircle2 size={16} strokeWidth={2} />
        )}
        <span>{testing ? '正在测试…' : '测试连接'}</span>
      </button>

      {/* Test result display */}
      {testResult && (
        <div
          className="flex items-center gap-bm-2 rounded-bm-md p-bm-3"
          style={{
            fontSize: 'var(--bm-text-sm)',
            background: testResult.success ? 'var(--bm-success-50)' : 'var(--bm-error-50)',
            border: `1px solid ${testResult.success ? 'var(--bm-success-100)' : 'var(--bm-error-100)'}`,
            color: testResult.success ? 'var(--bm-success-500)' : 'var(--bm-error-500)',
            animation: 'bmFadeIn 0.3s var(--bm-ease-out)',
          }}
        >
          {testResult.success ? (
            <CheckCircle2 size={16} strokeWidth={2} />
          ) : (
            <XCircle size={16} strokeWidth={2} />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionTester;
