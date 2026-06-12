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
    const baseClass = "transition-all rounded-lg shrink-0 flex items-center justify-center gap-2";
    const variantClass = variant === 'icon' ? "p-2.5" : "px-3 py-2 text-xs font-semibold";
    const activeClass = active 
      ? "axiom-button-active" 
      : "axiom-button-inactive";
    const disabledClass = props.disabled ? "opacity-30 cursor-not-allowed" : "";

    return (
      <button
        ref={ref}
        type="button"
        className={`${baseClass} ${variantClass} ${activeClass} ${disabledClass} ${className}`}
        {...props}
      >
        {icon}
        {label && <span className="hidden lg:inline">{label}</span>}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';
 
 
 