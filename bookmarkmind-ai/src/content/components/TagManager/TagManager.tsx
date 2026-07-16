// ============================================================
// TagManager — 标签管理面板（创建/重命名/删除/合并）
// ============================================================
import React, { useEffect, useState } from 'react';
import { TagChip } from './TagChip';
import { useTagStore } from '@content/store/tagStore';
import type { Tag } from '@shared/types';

export const TagManager: React.FC<{ showTitle?: boolean }> = ({
  showTitle = true,
}) => {
  const tags = useTagStore((s) => s.tags);
  const loadTags = useTagStore((s) => s.loadTags);
  const createTag = useTagStore((s) => s.createTag);
  const updateTag = useTagStore((s) => s.updateTag);
  const deleteTag = useTagStore((s) => s.deleteTag);
  const mergeTags = useTagStore((s) => s.mergeTags);

  const [newName, setNewName] = useState('');
  const [newPath, setNewPath] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [mergeSource, setMergeSource] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setCreateError('请输入标签名称');
      return;
    }
    const path = newPath.trim() || newName.trim();
    setCreateError(null);
    try {
      await createTag(newName.trim(), path);
      setNewName('');
      setNewPath('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '创建失败，请重试');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await updateTag(id, { name: editName.trim() });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTag(id);
    setConfirmDelete(null);
  };

  const handleMerge = async () => {
    if (!mergeSource) return;
    // Merge source into first available tag that is not source
    const target = tags.find((t) => t.id !== mergeSource);
    if (target) {
      await mergeTags(mergeSource, target.id);
    }
    setMergeSource(null);
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  // Group tags by path prefix
  const groupedTags = groupByPath(tags);

  return (
    <div style={containerStyle}>
      {showTitle && <h3 style={titleStyle}>标签管理</h3>}

      {/* Create new tag — always visible, including empty state */}
      <div style={createRowStyle}>
        <input
          type="text"
          placeholder="标签名称，如：待读"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            if (createError) setCreateError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
          style={inputStyle}
          autoFocus
        />
        <button style={primaryBtnStyle} onClick={() => void handleCreate()}>
          新建
        </button>
      </div>
      {createError && (
        <p style={errorStyle}>{createError}</p>
      )}

      {tags.length === 0 ? (
        <div style={emptyStyle}>
          <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-sm)' }}>
            还没有标签，在上方输入名称后点「新建」
          </span>
        </div>
      ) : (
        <>
          {/* Tag list */}
          <div style={listStyle}>
            {groupedTags.map((tag) => (
              <div key={tag.id} style={tagRowStyle}>
                {editingId === tag.id ? (
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(tag.id)}
                      style={{ ...inputStyle, flex: 1 }}
                      autoFocus
                    />
                    <button style={smallBtnStyle} onClick={() => handleUpdate(tag.id)}>保存</button>
                    <button style={smallBtnStyle} onClick={() => setEditingId(null)}>取消</button>
                  </div>
                ) : (
                  <>
                    <TagChip tag={tag} size="sm" />
                    <span style={pathStyle}>{tag.path}</span>
                    <span style={sourceLabelStyle}>
                      {tag.source === 'auto' ? 'AI' : tag.source === 'migrated' ? '迁移' : '手动'}
                    </span>
                    <div style={actionGroupStyle}>
                      {mergeSource === tag.id ? (
                        <button style={smallBtnStyle} onClick={handleMerge}>
                          确认合并
                        </button>
                      ) : (
                        <>
                          <button style={smallBtnStyle} onClick={() => startEdit(tag)}>编辑</button>
                          <button style={smallBtnStyle} onClick={() => setMergeSource(tag.id)}>合并</button>
                          <button
                            style={{ ...smallBtnStyle, color: 'var(--bm-error-500)' }}
                            onClick={() => setConfirmDelete(tag.id)}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Delete confirmation */}
          {confirmDelete && (
            <div style={confirmStyle}>
              <span>确定要删除此标签吗？其关联关系将被清除。</span>
              <div style={{ display: 'flex', gap: 'var(--bm-space-2)' }}>
                <button
                  style={{ ...btnStyle, background: 'var(--bm-error-500)', color: '#fff' }}
                  onClick={() => handleDelete(confirmDelete)}
                >
                  确认删除
                </button>
                <button style={btnStyle} onClick={() => setConfirmDelete(null)}>取消</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function groupByPath(tags: Tag[]): Tag[] {
  return [...tags].sort((a, b) => a.path.localeCompare(b.path));
}

// ---- Styles ----

const containerStyle: React.CSSProperties = {
  padding: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-lg)',
  fontWeight: 600,
  color: 'var(--bm-gray-800)',
  marginBottom: 'var(--bm-space-3)',
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: 'var(--bm-space-4) var(--bm-space-2)',
  textAlign: 'center',
};

const errorStyle: React.CSSProperties = {
  margin: '0 0 var(--bm-space-3)',
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-error-500)',
};

const createRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--bm-space-2)',
  marginBottom: 'var(--bm-space-4)',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  padding: 'var(--bm-space-1) var(--bm-space-2)',
  fontSize: 'var(--bm-text-sm)',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-700)',
  outline: 'none',
  flex: 1,
};

const btnStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-600)',
  fontSize: 'var(--bm-text-xs)',
  padding: 'var(--bm-space-1) var(--bm-space-3)',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
};

const primaryBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: 'var(--bm-primary-500)',
  color: '#fff',
  border: 'none',
  fontWeight: 500,
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--bm-space-1)',
  maxHeight: '300px',
  overflowY: 'auto',
};

const tagRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--bm-space-1) var(--bm-space-2)',
  borderRadius: 'var(--bm-radius-sm)',
  border: '1px solid var(--bm-gray-100)',
  gap: 'var(--bm-space-2)',
};

const pathStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-gray-400)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
};

const sourceLabelStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-gray-400)',
  whiteSpace: 'nowrap',
};

const actionGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  flexShrink: 0,
};

const smallBtnStyle: React.CSSProperties = {
  ...btnStyle,
  fontSize: 'var(--bm-text-xs)',
  padding: '1px var(--bm-space-2)',
};

const confirmStyle: React.CSSProperties = {
  marginTop: 'var(--bm-space-3)',
  padding: 'var(--bm-space-3)',
  background: 'var(--bm-error-50)',
  borderRadius: 'var(--bm-radius-sm)',
  fontSize: 'var(--bm-text-sm)',
  color: 'var(--bm-error-700)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--bm-space-2)',
};
