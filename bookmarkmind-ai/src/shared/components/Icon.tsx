import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface IconProps {
  /** lucide-react icon component */
  name: LucideIcon;
  /** Icon size in pixels */
  size: number;
  /** Optional color override (CSS value like 'var(--bm-primary-500)' or '#ff0000') */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Icon — A thin wrapper around lucide-react icons.
 *
 * Provides a consistent API for rendering icons with size and color
 * that works with the design token system.
 */
export const Icon: React.FC<IconProps> = ({ name: IconComponent, size, color, className }) => {
  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      style={{ flexShrink: 0 }}
    />
  );
};

export default Icon;
