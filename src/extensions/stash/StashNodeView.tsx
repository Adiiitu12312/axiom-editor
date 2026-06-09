import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Archive, Trash2 } from 'lucide-react';

export const StashNodeView: React.FC<NodeViewProps> = ({ deleteNode, selected, editor }) => {
  return (
    <NodeViewWrapper 
      className={`my-6 relative transition-all duration-300 rounded-xl overflow-hidden border-2 
        ${selected ? 'border-amber shadow-[0_0_15px_rgba(255,191,0,0.2)]' : 'border-amber/40 border-dashed hover:border-amber/70'}`}
    >
      {/* Header Bar */}
      <div className="bg-amber/10 px-4 py-2 border-b border-amber/20 flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-amber font-display font-semibold tracking-wide text-sm">
          <Archive className="w-4 h-4" />
          <span>STASHED NOTE <span className="opacity-60 text-xs ml-1">(Internal Only)</span></span>
        </div>

        {editor.isEditable && (
          <button 
            onClick={deleteNode} 
            className="p-1.5 text-amber/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Delete Stash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-charcoal/50 p-4 md:p-6 text-bone/90 prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0">
        <NodeViewContent className="min-h-[2rem]" />
      </div>
    </NodeViewWrapper>
  );
};
