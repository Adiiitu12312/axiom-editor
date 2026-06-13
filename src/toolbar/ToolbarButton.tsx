import React from 'react';
import type { ReactNode } from 'react';

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
  label?: string;
  variant?: 'icon' | 'text';
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ active, icon, label, variant = 'icon', className = '', ...props }, ref) => {
    const baseClass = "transition-all rounded-lg flex items-center justify-center";
    const activeClass = active 
      ? "axiom-button-active" 
      : "axiom-button-inactive";
    const disabledClass = props.disabled ? "opacity-30 cursor-not-allowed" : "";

    const paddingStyle = variant === 'icon' ? '8px' : '8px 12px';
    const gapStyle = label ? '8px' : '0px';

    return (
      <button
        ref={ref}
        type="button"
        className={`${baseClass} ${activeClass} ${disabledClass} ${className}`}
        style={{ flexShrink: 0, padding: paddingStyle, gap: gapStyle, ...props.style }}
        {...props}
      >
        {icon}
        {label && <span className="hidden lg:inline">{label}</span>}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';
 
 
 