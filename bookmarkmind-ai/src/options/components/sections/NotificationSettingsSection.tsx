/* ============================================================
   AI 书签管家 — Notification Settings Section
   使用 primitives: SectionCard, SubSection, ToggleRow (semantic tone), Callout
   ============================================================ */

import React from 'react';
import { Bell, Info, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { useOptionsStore } from '@options/store/optionsStore';
import type { NotificationSettings } from '@shared/types';
import {
  SectionCard,
  SubSection,
  ToggleRow,
  Callout,
  type ToggleTone,
} from '../primitives';

interface RowDef {
  key: keyof NotificationSettings;
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: ToggleTone;
}

const ROWS: RowDef[] = [
  {
    key: 'toastSuccess',
    icon: <CheckCircle2 size={18} />,
    title: '成功提示',
    description: '收藏、删除恢复、分类完成等成功操作时显示提示',
    tone: 'success',
  },
  {
    key: 'toastError',
    icon: <AlertCircle size={18} />,
    title: '错误提示',
    description: 'AI 连接失败、操作异常等错误发生时显示提示',
    tone: 'error',
  },
  {
    key: 'toastInfo',
    icon: <Info size={18} />,
    title: '信息提示',
    description: '日常状态更新、快捷键提示等轻量信息',
    tone: 'info',
  },
  {
    key: 'notifyBrokenLinks',
    icon: <Bell size={18} />,
    title: '失效链接提醒',
    description: '检测到收藏链接失效时高亮提示（需手动触发链接检查）',
    tone: 'warning',
  },
  {
    key: 'dailySummary',
    icon: <Mail size={18} />,
    title: '每日使用摘要',
    description: '每天首次打开浏览器时展示昨日收藏/分类统计',
    tone: 'info',
  },
];

const NotificationSettingsSection: React.FC = () => {
  const { config, setNotificationConfig } = useOptionsStore();
  const notifications = config.app.notifications;

  return (
    <SectionCard
      title="通知设置"
      subtitle="控制扩展在何时以何种方式向您反馈操作结果 — 颜色本身就是分类提示"
    >
      <SubSection
        icon={<Bell size={15} strokeWidth={2.2} />}
        title="通知"
        caption={`${ROWS.filter((r) => notifications[r.key]).length} / ${ROWS.length} 启用`}
      >
        {ROWS.map((row) => (
          <ToggleRow
            key={row.key}
            icon={row.icon}
            title={row.title}
            description={row.description}
            checked={notifications[row.key]}
            onChange={(v) => setNotificationConfig({ [row.key]: v })}
            ariaLabel={row.title}
            tone={row.tone}
          />
        ))}
      </SubSection>

      <div className="mt-bm-5">
        <Callout icon={<Info size={14} strokeWidth={2} />} tone="privacy">
          所有通知均为扩展内浮层，不会调用系统通知权限，也不会离开当前页面打扰您。
        </Callout>
      </div>
    </SectionCard>
  );
};

export default NotificationSettingsSection;