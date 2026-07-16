/* ============================================================
   AI 书签管家 — Options Header
   设计：H1 大字号 + 保存状态指示 + 主题切换 + 外部链接
   ============================================================ */

import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Sun,
  Moon,
  Monitor,
  Check,
  Github,
  ChevronDown,
} from 'lucide-react';
import { useOptionsStore } from '../store/optionsStore';
import type { ThemeMode } from '@shared/types';

const GITHUB_URL = 'https://github.com/bookmarkmind-ai';

/* ---- 格式化相对时间 ---- */
function formatRelative(ts: number | null, now: number): string {
  if (!ts) return '尚未保存';
  const diff = Math.max(0, now - ts);
  if (diff < 5000) return '刚刚';
  if (diff < 60_000) return `${Math.floor(diff / 1000)} 秒前`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return `${Math.floor(diff / 86_400_000)} 天前`;
}

/* ---- 保存状态指示 ---- */
const SaveIndicator: React.FC = () => {
  const { isSaving, lastSavedAt } = useOptionsStore();
  const [, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  let label: string;
  let dotColor: string;
  let Icon = Check;
  if (isSaving) {
    label = '正在保存…';
    dotColor = 'var(--bm-primary-400)';
    Icon = Check;
  } else if (lastSavedAt) {
    label = `已保存 · ${formatRelative(lastSavedAt, Date.now())}`;
    dotColor = 'var(--bm-state-success)';
    Icon = Check;
  } else {
    label = '自动保存中';
    dotColor = 'var(--bm-text-muted)';
    Icon = Check;
  }

  return (
    <span
      className="flex items-center gap-bm-2"
      style={{
        fontSize: 'var(--bm-text-xs)',
        color: 'var(--bm-text-muted)',
        fontFamily: 'var(--bm-font-sans)',
        letterSpacing: 'var(--bm-tracking-tight)',
      }}
      data-testid="save-indicator"
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: dotColor,
          boxShadow: isSaving ? '0 0 0 3px var(--bm-accent-18)' : 'none',
          animation: isSaving ? 'bm-blink 1.2s var(--bm-ease-default) infinite' : 'none',
        }}
      />
      <Icon size={11} strokeWidth={2.5} style={{ opacity: 0.6 }} />
      <span>{label}</span>
    </span>
  );
};

/* ---- 主题切换下拉 ---- */
const ThemeToggle: React.FC = () => {
  const { config, setAppConfig } = useOptionsStore();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const openMenu = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    setOpen((v) => !v);
  };

  const current: ThemeMode = config.app.theme;
  const CurrentIcon = current === 'light' ? Sun : current === 'dark' ? Moon : Monitor;
  const currentLabel =
    current === 'light' ? '浅色' : current === 'dark' ? '深色' : '跟随系统';

  const options: Array<{ value: ThemeMode; icon: typeof Sun; label: string; hint: string }> = [
    { value: 'light', icon: Sun, label: '浅色', hint: '暖石白 + 橙色' },
    { value: 'dark', icon: Moon, label: '深色', hint: '墨黑 + 灯下暖光' },
    { value: 'system', icon: Monitor, label: '跟随系统', hint: '随系统主题切换' },
  ];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={openMenu}
        className="flex items-center gap-bm-2 rounded-bm-md outline-none"
        style={{
          height: '32px',
          padding: '0 10px 0 8px',
          fontSize: 'var(--bm-text-sm)',
          color: 'var(--bm-text-secondary)',
          background: 'var(--bm-bg-elevated)',
          border: '1px solid var(--bm-border-subtle)',
          cursor: 'pointer',
          transition: 'all .22s var(--bm-ease-out)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bm-bg-overlay)';
          e.currentTarget.style.color = 'var(--bm-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bm-bg-elevated)';
          e.currentTarget.style.color = 'var(--bm-text-secondary)';
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="theme-toggle"
      >
        <CurrentIcon size={14} strokeWidth={2} />
        <span>{currentLabel}</span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          style={{
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .2s var(--bm-ease-out)',
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="rounded-bm-md"
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            right: `${menuPos.right}px`,
            minWidth: '180px',
            background: 'var(--bm-bg-elevated)',
            border: '1px solid var(--bm-border-strong)',
            boxShadow: 'var(--bm-shadow-panel)',
            padding: '4px',
            zIndex: 9999,
            animation: 'bm-fade-in 180ms var(--bm-ease-out)',
          }}
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const selected = current === opt.value;
            return (
              <button
                key={opt.value}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setAppConfig({ theme: opt.value });
                  setOpen(false);
                }}
                className="flex items-center gap-bm-2 w-full rounded-bm-sm outline-none"
                style={{
                  padding: '8px 10px',
                  background: selected ? 'var(--bm-bg-overlay)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: selected ? 'var(--bm-text-accent)' : 'var(--bm-text-primary)',
                  transition: 'background .15s var(--bm-ease-out)',
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = 'var(--bm-bg-overlay)';
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={14} strokeWidth={2} />
                <span style={{ fontSize: 'var(--bm-text-sm)', fontWeight: selected ? 600 : 400 }}>
                  {opt.label}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 'var(--bm-text-xs)',
                    color: 'var(--bm-text-muted)',
                  }}
                >
                  {opt.hint}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---- Header 主组件 ---- */
const OptionsHeader: React.FC = () => {
  return (
    <header
      className="flex items-center justify-between px-bm-6"
      style={{
        height: '60px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        overflow: 'visible',
        borderBottom: '1px solid var(--bm-border-subtle)',
        backdropFilter: 'blur(8px)',
        background: 'var(--bm-bg-canvas)',
        boxShadow: '0 1px 0 var(--bm-accent-04)',
        flexShrink: 0,
      }}
    >
      {/* Left: logo + 大字号标题 H1 */}
      <div className="flex items-center gap-bm-3">
        <div
          className="rounded-bm-md flex items-center justify-center"
          style={{
            width: '34px',
            height: '34px',
            background: 'transparent',
            border: '1px solid var(--bm-border-subtle)',
          }}
        >
          <BookOpen
            size={17}
            strokeWidth={2}
            style={{ color: 'var(--bm-amber-500)' }}
          />
        </div>
        <div className="flex flex-col" style={{ lineHeight: 1.1 }}>
          <h1
            style={{
              fontFamily: 'var(--bm-font-display)',
              fontSize: 'var(--bm-text-xl)',
              fontWeight: 600,
              color: 'var(--bm-text-heading)',
              letterSpacing: 'var(--bm-tracking-tight)',
              margin: 0,
            }}
          >
            AI 书签管家
          </h1>
          <span
            style={{
              fontSize: '9px',
              color: 'var(--bm-text-muted)',
              fontFamily: 'var(--bm-font-mono)',
              letterSpacing: 'var(--bm-tracking-stamp)',
              textTransform: 'uppercase',
              opacity: 0.6,
              marginTop: '1px',
            }}
          >
            v1.0.0 · MARGINALIA
          </span>
        </div>
      </div>

      {/* Right: save status + theme toggle + github */}
      <div className="flex items-center gap-bm-4">
        <SaveIndicator />

        <div
          style={{
            width: '1px',
            height: '20px',
            background: 'var(--bm-border-subtle)',
          }}
        />

        <ThemeToggle />

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-bm-md outline-none"
          style={{
            width: '32px',
            height: '32px',
            color: 'var(--bm-text-secondary)',
            background: 'var(--bm-bg-elevated)',
            border: '1px solid var(--bm-border-subtle)',
            textDecoration: 'none',
            transition: 'all .22s var(--bm-ease-out)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bm-bg-overlay)';
            e.currentTarget.style.color = 'var(--bm-text-accent)';
            e.currentTarget.style.borderColor = 'var(--bm-border-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bm-bg-elevated)';
            e.currentTarget.style.color = 'var(--bm-text-secondary)';
            e.currentTarget.style.borderColor = 'var(--bm-border-subtle)';
          }}
          title="GitHub 源码"
          aria-label="GitHub 源码"
          data-testid="github-link"
        >
          <Github size={15} strokeWidth={2} />
        </a>
      </div>
    </header>
  );
};

export default OptionsHeader;