/* ============================================================
   Primitive — Field
   表单字段：label + description + 控件
   label: text-sm + font-medium + text-heading
   description: display italic + text-xs + text-secondary
   ============================================================ */

import React from 'react';

interface FieldProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, description, children }) => (
  <div className="mb-bm-4" style={{ paddingBottom: '4px' }}>
    <div className="flex items-baseline justify-between gap-bm-3 mb-bm-2">
      <label
        style={{
          fontSize: 'var(--bm-text-sm)',
          fontWeight: 500,
          color: 'var(--bm-text-heading)',
          letterSpacing: 'var(--bm-tracking-tight)',
        }}
      >
        {label}
      </label>
    </div>
    {description && (
      <div
        className="mb-bm-2"
        style={{
          fontSize: 'var(--bm-text-xs)',
          color: 'var(--bm-text-secondary)',
          fontFamily: 'var(--bm-font-display)',
          fontStyle: 'italic',
          letterSpacing: 'var(--bm-tracking-tight)',
        }}
      >
        {description}
      </div>
    )}
    {children}
  </div>
);

export default Field;