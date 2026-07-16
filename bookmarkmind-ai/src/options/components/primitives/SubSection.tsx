/* ============================================================
   Primitive — SubSection
   卡内分区：顶部 1px 分隔线 + 3px 琥珀书签带 + icon + title + caption
   ============================================================ */

import React from 'react';

interface SubSectionProps {
  /** 分区图标（推荐 lucide-react） */
  icon: React.ReactNode;
  /** 分区标题 */
  title: React.ReactNode;
  /** 右侧 caption（如数量/分类提示） */
  caption?: React.ReactNode;
  /** 首个分区可设为 true，去掉顶部分割线 */
  noDivider?: boolean;
  children: React.ReactNode;
}

export const SubSection: React.FC<SubSectionProps> = ({
  icon,
  title,
  caption,
  noDivider,
  children,
}) => (
  <section
    className="bm-subsection"
    style={{
      padding: noDivider ? '0 0 14px' : '14px 0',
      marginTop: noDivider ? 0 : '4px',
    }}
  >
    <div
      className="flex items-center gap-bm-2 mb-bm-3"
      style={{ paddingLeft: '12px', borderLeft: '3px solid var(--bm-amber-500)' }}
    >
      <span style={{ color: 'var(--bm-text-accent)', display: 'inline-flex' }}>
        {icon}
      </span>
      <h3
        style={{
          fontFamily: 'var(--bm-font-display)',
          fontSize: 'var(--bm-text-md)',
          fontWeight: 600,
          color: 'var(--bm-text-heading)',
          letterSpacing: 'var(--bm-tracking-tight)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {caption && (
        <span
          style={{
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-muted)',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            marginLeft: 'auto',
          }}
        >
          {caption}
        </span>
      )}
    </div>
    <div style={{ paddingLeft: '15px' }}>{children}</div>
  </section>
);

export default SubSection;