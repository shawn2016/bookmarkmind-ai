/* ============================================================
   AI 书签管家 — About Section
   使用 primitives: SectionCard, SubSection, Callout
   ============================================================ */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Github, ExternalLink, Shield, FileText } from 'lucide-react';
import { SectionCard, SubSection, Callout } from '../primitives';

const GITHUB_URL = 'https://github.com/bookmarkmind-ai';

/* Link Row — 在卡内的"资源"分区 */
const LinkRow: React.FC<{
  icon: LucideIcon;
  label: string;
  href: string;
}> = ({ icon: IconComp, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-bm-3 rounded-bm-md p-bm-3 outline-none"
    style={{
      fontSize: 'var(--bm-text-sm)',
      color: 'var(--bm-text-secondary)',
      background: 'var(--bm-bg-elevated)',
      border: '1px solid var(--bm-border-subtle)',
      textDecoration: 'none',
      cursor: 'pointer',
      transition:
        'background .22s var(--bm-ease-out), color .22s var(--bm-ease-out), border-color .22s var(--bm-ease-out), transform .32s var(--bm-ease-spring)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--bm-bg-overlay)';
      e.currentTarget.style.color = 'var(--bm-text-primary)';
      e.currentTarget.style.borderColor = 'var(--bm-border-accent)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'var(--bm-bg-elevated)';
      e.currentTarget.style.color = 'var(--bm-text-secondary)';
      e.currentTarget.style.borderColor = 'var(--bm-border-subtle)';
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.transform = 'scale(0.99)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    <IconComp size={16} strokeWidth={2} style={{ color: 'var(--bm-text-accent)', flexShrink: 0 }} />
    <span style={{ flex: 1 }}>{label}</span>
    <ExternalLink size={12} strokeWidth={2} style={{ color: 'var(--bm-text-muted)', flexShrink: 0 }} />
  </a>
);

const AboutSection: React.FC = () => {
  return (
    <SectionCard
      title="关于"
      subtitle="版本 · 资源 · 隐私"
    >
      {/* 应用标识 */}
      <SubSection
        icon={<BookOpen size={15} strokeWidth={2.2} />}
        title="AI 书签管家"
        caption="v1.0.0"
        noDivider
      >
        <div className="flex flex-col items-center gap-bm-3 py-bm-5">
          <div
            className="rounded-bm-xl flex items-center justify-center"
            style={{
              width: '72px',
              height: '72px',
              background: 'var(--bm-bg-elevated)',
              border: '2px solid var(--bm-border-accent)',
              boxShadow: '0 4px 16px var(--bm-accent-20)',
            }}
          >
            <BookOpen size={36} strokeWidth={2} style={{ color: 'var(--bm-amber-500)' }} />
          </div>
          <p
            style={{
              fontFamily: 'var(--bm-font-display)',
              fontSize: 'var(--bm-text-base)',
              color: 'var(--bm-text-secondary)',
              lineHeight: 'var(--bm-leading-relaxed)',
              textAlign: 'center',
              margin: 0,
              maxWidth: '480px',
              fontStyle: 'italic',
              letterSpacing: 'var(--bm-tracking-tight)',
            }}
          >
            AI 驱动的 Chrome 书签管理扩展 — 收藏即整理，搜索即对话。利用 AI
            智能分类书签，支持自然语言搜索，让您的书签库井井有条。
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-text-muted)',
              fontFamily: 'var(--bm-font-mono)',
              letterSpacing: 'var(--bm-tracking-stamp)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              opacity: 0.6,
            }}
          >
            MARGINALIA · LIBRARY
          </a>
        </div>
      </SubSection>

      {/* 资源链接 */}
      <SubSection
        icon={<ExternalLink size={15} strokeWidth={2.2} />}
        title="资源"
        caption="链接 · 仓库"
      >
        <div className="flex flex-col gap-bm-2">
          <LinkRow icon={Github} label="GitHub 源码" href={GITHUB_URL} />
          <LinkRow icon={ExternalLink} label="Chrome Web Store" href="https://chrome.google.com/webstore/detail/bookmarkmind-ai" />
          <LinkRow icon={FileText} label="反馈与建议" href={`${GITHUB_URL}/issues`} />
        </div>
      </SubSection>

      {/* 隐私声明 */}
      <SubSection
        icon={<Shield size={15} strokeWidth={2.2} />}
        title="隐私"
        caption="本地优先"
      >
        <Callout icon={<Shield size={14} strokeWidth={2} />} tone="privacy">
          AI 书签管家尊重您的隐私。所有数据（书签信息、AI 配置、使用记录）仅存储在本地浏览器中。
          AI 请求直接发送到您配置的服务商，本扩展不收集、不传输、不分享任何用户数据。
        </Callout>

        <p
          style={{
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-muted)',
            marginTop: '12px',
            textAlign: 'center',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            letterSpacing: 'var(--bm-tracking-tight)',
          }}
        >
          本项目基于 MIT License 开源。感谢所有贡献者和开源社区的支持。
        </p>
      </SubSection>
    </SectionCard>
  );
};

export default AboutSection;