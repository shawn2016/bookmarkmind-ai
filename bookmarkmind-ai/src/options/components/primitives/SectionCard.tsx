/* ============================================================
   Primitive — SectionCard
   主区卡片：bg-surface + border-subtle + shadow-card + rounded-xl
   顶部可带渐变 header（title + subtitle），内部分区用 SubSection
   ============================================================ */

import React from 'react';

interface SectionCardProps {
  /** 主标题（H2 · display 字体 · text-heading） */
  title?: React.ReactNode;
  /** 副标题（display italic · text-secondary） */
  subtitle?: React.ReactNode;
  /** 右上角控件（如「新建」「展开全部」按钮组） */
  actions?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 最大宽度（默认 640px） */
  maxWidth?: number;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  actions,
  className,
  maxWidth = 640,
  children,
}) => {
  const hasHeader = title || subtitle || actions;

  return (
    <section
      className={className}
      style={{
        maxWidth: `${maxWidth}px`,
        background: 'var(--bm-bg-surface)',
        border: '1px solid var(--bm-border-subtle)',
        boxShadow: 'var(--bm-shadow-card)',
        borderRadius: 'var(--bm-radius-xl)',
        overflow: 'visible',
      }}
    >
      {hasHeader && (
        <header
          className="px-bm-6 py-bm-5 flex items-start justify-between gap-bm-4"
          style={{
            background:
              'linear-gradient(180deg, var(--bm-accent-06) 0%, transparent 100%)',
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  fontFamily: 'var(--bm-font-display)',
                  fontSize: 'var(--bm-text-2xl)',
                  fontWeight: 600,
                  color: 'var(--bm-text-heading)',
                  letterSpacing: 'var(--bm-tracking-tight)',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 'var(--bm-text-sm)',
                  color: 'var(--bm-text-secondary)',
                  marginTop: '4px',
                  fontFamily: 'var(--bm-font-display)',
                  fontStyle: 'italic',
                  letterSpacing: 'var(--bm-tracking-tight)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-bm-2">{actions}</div>}
        </header>
      )}
      <div className="px-bm-6 py-bm-5" style={{ overflow: 'hidden', borderRadius: '0 0 var(--bm-radius-xl) var(--bm-radius-xl)' }}>{children}</div>
    </section>
  );
};

export default SectionCard;