// ============================================================
// CatalogStamp — 签名元素 / Signature Element
//
// 每个书签带一枚小型等宽字体的「BK·分类·编号」烫金戳记，
// 像图书馆的杜威十进制号。这是整个设计的唯一标识 —
// 跟书签/知识管理的"目录学"心智对齐。
//
// 设计上保持低调：9px、字距宽、琥珀色描边、烫金阴影。
// 入场时带「盖章」动画（letter-spacing 从宽到正常 + 微旋转）。
//
// 不喧宾夺主 — 这是 skill 强调的"spend boldness in one place"。
// ============================================================

import React from 'react';

interface CatalogStampProps {
  /** 分类前缀，例如 "TECH"、"AI"、"READ" */
  category: string;
  /** 该分类下的序号 */
  index: number;
  /** 入场延迟（ms），让多个 stamp 有层次感 */
  delay?: number;
  /** 是否带脉冲高亮（用于 "今日新增" 等场景） */
  pulse?: boolean;
}

const PREFIX_MAX = 6;

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/** 把任意分类名压缩成大写、最多 6 字符 */
function normalizePrefix(input: string): string {
  const cleaned = input
    .replace(/[一-龥]/g, 'C')     // 中文 → "C"
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, PREFIX_MAX);
  return cleaned || 'GEN';
}

export const CatalogStamp: React.FC<CatalogStampProps> = ({
  category,
  index,
  delay = 0,
  pulse = false,
}) => {
  const prefix = normalizePrefix(category);
  const code = `BK·${prefix}·${pad(index, 3)}`;

  return (
    <span
      className={`bm-stamp${pulse ? ' bm-stamp--fade' : ''}`}
      style={{ ['--bm-stamp-delay' as string]: `${delay}ms` }}
      aria-label={`馆藏编号 ${code}`}
      title={`馆藏编号 ${code}`}
    >
      {code}
    </span>
  );
};

export default CatalogStamp;