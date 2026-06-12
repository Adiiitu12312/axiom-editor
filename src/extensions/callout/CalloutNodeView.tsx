import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export const CalloutNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, selected }) => {
  const { emoji, type } = node.attrs;

  const typeStyles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100',
    error: 'bg-red-500/10 border-red-500/30 text-red-100',
  };

  const currentStyle = typeStyles[type as keyof typeof typeStyles] || typeStyles.info;

  const cycleEmoji = () => {
    const emojis = ['💡', '⚠️', '✅', '❌', '🔥', '📌', '✨'];
    const currentIndex = emojis.indexOf(emoji);
    const nextEmoji = emojis[(currentIndex + 1) % emojis.length];
    
    // Cycle type based on emoji roughly
    let nextType = 'info';
    if (nextEmoji === '⚠️') nextType = 'warning';
    if (nextEmoji === '✅') nextType = 'success';
    if (nextEmoji === '❌') nextType = 'error';

    updateAttributes({ emoji: nextEmoji, type: nextType });
  };

  return (
    <NodeViewWrapper 
      className={`my-6 flex gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-300
        ${currentStyle}
        ${selected ? 'ring-2 ring-white/20 shadow-lg' : 'shadow-md'}
      `}
    >
      <button 
        contentEditable={false}
        onClick={cycleEmoji}
        className="text-2xl shrink-0 mt-0.5 hover:scale-110 active:scale-95 transition-transform select-none cursor-pointer"
        title="Change Icon"
      >
        {emoji}
      </button>
      
      <div className="flex-1 font-medium leading-relaxed">
        <NodeViewContent className="min-h-[1.5rem]" />
      </div>
    </NodeViewWrapper>
  );
};
 
 
 