// ============================================================
// ResurfaceTab — daily bookmark rediscovery feed
// ============================================================
import React, { useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useResurfaceStore } from '@content/store/resurfaceStore';
import type { ResurfaceAction } from '@shared/types';
import { ResurfaceCard } from './ResurfaceCard';

export const ResurfaceTab: React.FC = () => {
  const cards = useResurfaceStore(s => s.cards);
  const loading = useResurfaceStore(s => s.loading);
  const hasMore = useResurfaceStore(s => s.hasMore);
  const prefs = useResurfaceStore(s => s.prefs);
  const loadCards = useResurfaceStore(s => s.loadCards);
  const refreshCards = useResurfaceStore(s => s.refreshCards);
  const loadMore = useResurfaceStore(s => s.loadMore);
  const handleAction = useResurfaceStore(s => s.handleAction);
  const loadPrefs = useResurfaceStore(s => s.loadPrefs);

  useEffect(() => {
    loadCards();
    loadPrefs();
  }, []);

  const onAction = async (bookmarkId: string, action: ResurfaceAction) => {
    await handleAction(bookmarkId, action);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--bm-space-3)',
    borderBottom: '1px solid var(--bm-gray-200)',
  };

  const headerTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-2)',
    fontSize: 'var(--bm-text-md)',
    fontWeight: 600,
    color: 'var(--bm-gray-700)',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--bm-space-3)',
  };

  const centerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 'var(--bm-space-4)',
    padding: 'var(--bm-space-6)',
  };

  const actionBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-1)',
    border: '1px solid var(--bm-gray-200)',
    borderRadius: 'var(--bm-radius-sm)',
    background: 'var(--bm-gray-0)',
    color: 'var(--bm-gray-600)',
    fontSize: 'var(--bm-text-xs)',
    fontWeight: 500,
    padding: 'var(--bm-space-1) var(--bm-space-3)',
    cursor: 'pointer',
  };

  // Paused state
  if (prefs.paused) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>
            <Sparkles size={16} color="var(--bm-primary-500)" />
            再发现
          </div>
        </div>
        <div style={centerStyle}>
          <AlertCircle size={32} color="var(--bm-warning-500)" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--bm-text-md)', fontWeight: 600, color: 'var(--bm-gray-600)', marginBottom: 'var(--bm-space-2)' }}>
              推送已暂停
            </div>
            <div style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-gray-400)' }}>
              由于连续多次未互动，再发现推送已自动暂停。
            </div>
            <div style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-gray-400)', marginBottom: 'var(--bm-space-4)' }}>
              与推荐的书签互动即可恢复推送。
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && cards.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>
            <Sparkles size={16} color="var(--bm-primary-500)" />
            再发现
          </div>
          <button style={actionBtnStyle} onClick={refreshCards}>
            <RefreshCw size={12} />
            刷新
          </button>
        </div>
        <div style={centerStyle}>
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid var(--bm-primary-200)',
              borderTopColor: 'var(--bm-primary-500)',
              borderRadius: '50%',
              animation: 'bm-blink 1s linear infinite',
            }}
          />
          <span style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-gray-400)' }}>
            正在为你寻找被遗忘的书签...
          </span>
        </div>
      </div>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={headerTitleStyle}>
            <Sparkles size={16} color="var(--bm-primary-500)" />
            再发现
          </div>
          <button style={actionBtnStyle} onClick={refreshCards}>
            <RefreshCw size={12} />
            刷新
          </button>
        </div>
        <div style={centerStyle}>
          <Sparkles size={32} color="var(--bm-gray-300)" />
          <span style={{ fontSize: 'var(--bm-text-md)', color: 'var(--bm-gray-400)' }}>
            暂无推荐书签
          </span>
          <span style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-gray-300)' }}>
            {prefs.enabled
              ? '收藏满30天后会开始推荐'
              : '请在设置中开启再发现推送'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerTitleStyle}>
          <Sparkles size={16} color="var(--bm-primary-500)" />
          再发现
        </div>
        <button style={actionBtnStyle} onClick={refreshCards}>
          <RefreshCw size={12} />
          换一批
        </button>
      </div>

      <div style={contentStyle}>
        {cards.map(card => (
          <ResurfaceCard
            key={card.bookmarkId}
            card={card}
            onAction={onAction}
          />
        ))}

        {hasMore && (
          <div style={{ textAlign: 'center', padding: 'var(--bm-space-4)' }}>
            <button
              style={{
                ...actionBtnStyle,
                padding: 'var(--bm-space-2) var(--bm-space-4)',
              }}
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}

        {!hasMore && cards.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--bm-space-4)',
            color: 'var(--bm-gray-300)',
            fontSize: 'var(--bm-text-sm)',
          }}>
            没有更多了
          </div>
        )}
      </div>
    </div>
  );
};

export default ResurfaceTab;
