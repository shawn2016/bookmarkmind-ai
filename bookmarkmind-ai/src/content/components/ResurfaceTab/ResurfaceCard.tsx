// ============================================================
// ResurfaceCard — single card in the resurface feed
// ============================================================
import React from 'react';
import { ExternalLink, Archive, X, RefreshCw } from 'lucide-react';
import type { ResurfaceAction } from '@shared/types';
import type { ResurfaceCardData } from '@content/store/resurfaceStore';

interface ResurfaceCardProps {
  card: ResurfaceCardData;
  onAction: (bookmarkId: string, action: ResurfaceAction) => void;
}

export const ResurfaceCard: React.FC<ResurfaceCardProps> = ({ card, onAction }) => {
  const daysText = card.daysSinceAdded <= 7
    ? `${card.daysSinceAdded} 天前收藏`
    : card.daysSinceAdded <= 30
      ? `${card.daysSinceAdded} 天前收藏`
      : card.daysSinceAdded <= 365
        ? `${Math.floor(card.daysSinceAdded / 30)} 个月前收藏`
        : `${Math.floor(card.daysSinceAdded / 365)} 年前收藏`;

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--bm-gray-200)',
    borderRadius: 'var(--bm-radius-md)',
    padding: 'var(--bm-space-4)',
    marginBottom: 'var(--bm-space-3)',
    backgroundColor: 'var(--bm-gray-0)',
    boxShadow: 'var(--bm-shadow-card)',
    transition: 'transform var(--bm-duration-fast) var(--bm-ease-default)',
    cursor: 'default',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: 'var(--bm-space-2)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-md)',
    fontWeight: 600,
    color: 'var(--bm-gray-800)',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1,
    cursor: 'pointer',
  };

  const domainStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-xs)',
    color: 'var(--bm-gray-400)',
    marginTop: 'var(--bm-space-1)',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--bm-space-3)',
    paddingTop: 'var(--bm-space-2)',
    borderTop: '1px solid var(--bm-gray-100)',
  };

  const actionBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    border: 'none',
    background: 'transparent',
    color: 'var(--bm-gray-400)',
    fontSize: 'var(--bm-text-xs)',
    cursor: 'pointer',
    padding: '2px var(--bm-space-1)',
    borderRadius: '4px',
    transition: 'color var(--bm-duration-fast), background var(--bm-duration-fast)',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    background: 'var(--bm-primary-50)',
    color: 'var(--bm-primary-500)',
    fontSize: 'var(--bm-text-xs)',
    padding: '1px var(--bm-space-2)',
    borderRadius: 'var(--bm-radius-full)',
    whiteSpace: 'nowrap',
  };

  const handleOpen = () => {
    window.open(card.url, '_blank');
    onAction(card.bookmarkId, 'opened');
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <img
          src={card.faviconUrl ?? ''}
          alt=""
          style={{
            width: '20px',
            height: '20px',
            marginRight: 'var(--bm-space-3)',
            marginTop: '2px',
            borderRadius: '4px',
          }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={{ flex: 1 }}>
          <div style={titleStyle} onClick={handleOpen}>
            {card.title}
          </div>
          <div style={domainStyle}>
            {card.domain}
          </div>
        </div>
      </div>

      {/* AI annotation badge */}
      <div style={{ marginBottom: 'var(--bm-space-2)' }}>
        <span style={badgeStyle}>
          <RefreshCw size={10} />
          {daysText}
        </span>
        {card.score > 0 && (
          <span style={{ ...badgeStyle, marginLeft: 'var(--bm-space-1)', opacity: 0.6 }}>
            推荐度 {Math.round(card.score * 100)}
          </span>
        )}
      </div>

      {/* Footer actions */}
      <div style={footerStyle}>
        <button
          style={actionBtnStyle}
          onClick={handleOpen}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--bm-primary-500)';
            e.currentTarget.style.background = 'var(--bm-primary-50)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--bm-gray-400)';
            e.currentTarget.style.background = 'transparent';
          }}
          title="打开链接"
        >
          <ExternalLink size={12} />
          打开
        </button>

        <div style={{ display: 'flex', gap: 'var(--bm-space-1)' }}>
          <button
            style={actionBtnStyle}
            onClick={() => onAction(card.bookmarkId, 'archived')}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--bm-warning-500)';
              e.currentTarget.style.background = 'var(--bm-warning-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--bm-gray-400)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="归档（不再推送）"
          >
            <Archive size={12} />
            归档
          </button>

          <button
            style={actionBtnStyle}
            onClick={() => onAction(card.bookmarkId, 'dismissed')}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--bm-error-500)';
              e.currentTarget.style.background = 'var(--bm-error-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--bm-gray-400)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="不感兴趣（90天内不再推送）"
          >
            <X size={12} />
            不感兴趣
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResurfaceCard;
