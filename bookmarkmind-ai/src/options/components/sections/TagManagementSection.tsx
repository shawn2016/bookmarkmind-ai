/* ============================================================
   AI 书签管家 — Tag Management Section (Options)
   ============================================================ */

import React from 'react';
import { Tags } from 'lucide-react';
import { TagManager } from '@content/components/TagManager/TagManager';
import { SectionCard } from '../primitives';

const TagManagementSection: React.FC = () => {
  return (
    <SectionCard
      title="标签管理"
      subtitle="创建、重命名、合并标签，用于筛选和整理书签"
    >
      <div
        className="rounded-bm-md"
        style={{
          border: '1px solid var(--bm-border-subtle)',
          padding: 'var(--bm-space-4)',
          background: 'var(--bm-bg-elevated)',
        }}
      >
        <div
          className="flex items-center gap-bm-2 mb-bm-4"
          style={{ color: 'var(--bm-text-secondary)', fontSize: 'var(--bm-text-sm)' }}
        >
          <Tags size={15} />
          <span>标签与书签的关联可在收藏时或书签详情中设置</span>
        </div>
        <TagManager />
      </div>
    </SectionCard>
  );
};

export default TagManagementSection;
