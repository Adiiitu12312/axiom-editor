import { NodeViewWrapper } from '@tiptap/react';
import { Trash2 } from 'lucide-react';

export const CustomHorizontalRule = ({ deleteNode }: { deleteNode: () => void }) => {
  return (
    <NodeViewWrapper className="axiom-hr-wrapper my-8 group relative flex items-center justify-center select-none" contentEditable={false}>
      {/* Horizontal Line */}
      <div className="w-full border-t border-smoke/50 group-hover:border-red-500/20 transition-colors" />
      
      {/* Centered Trash Delete Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteNode();
        }}
        className="absolute bg-[#141416]/95 border border-red-500/30 hover:border-red-500/90 text-red-500 hover:text-red-400 p-1.5 rounded-lg transition-all shadow-lg cursor-pointer flex items-center justify-center focus:outline-none z-10 backdrop-blur-sm"
        title="Delete Divider"
      >
        <Trash2 size={13} className="transition-transform active:scale-90" />
      </button>
    </NodeViewWrapper>
  );
};
 