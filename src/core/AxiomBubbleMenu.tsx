import React, { useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Palette,
  ChevronDown,
  Trash2,
  Copy
} from 'lucide-react';
import { useAxiomEditor } from './AxiomEditorContext';

interface AxiomBubbleMenuProps {
  editor: Editor;
}

const TEXT_COLORS = [
  { name: 'Default', value: '#e4e4e7' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' }
];

const BG_COLORS = [
  { name: 'None', value: 'transparent' },
  { name: 'Amber Glow', value: 'rgba(245, 158, 11, 0.15)' },
  { name: 'Red Glow', value: 'rgba(239, 68, 68, 0.15)' },
  { name: 'Green Glow', value: 'rgba(16, 185, 129, 0.15)' },
  { name: 'Blue Glow', value: 'rgba(59, 130, 246, 0.15)' },
  { name: 'Purple Glow', value: 'rgba(139, 92, 246, 0.15)' }
];

const TURN_INTO_OPTIONS = [
  { name: 'Paragraph', value: 'paragraph' },
  { name: 'Heading 1', value: 'h1' },
  { name: 'Heading 2', value: 'h2' },
  { name: 'Heading 3', value: 'h3' },
  { name: 'Bullet List', value: 'bulletList' },
  { name: 'Ordered List', value: 'orderedList' }
];

export const AxiomBubbleMenu: React.FC<AxiomBubbleMenuProps> = ({ editor }) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showTurnIntoMenu, setShowTurnIntoMenu] = useState(false);

  const { features } = useAxiomEditor();

  if (!editor || features?.bubbleMenu === false) return null;

  const allowedItems = Array.isArray(features?.bubbleMenu) 
    ? features.bubbleMenu 
    : (typeof features?.bubbleMenu === 'object' ? features.bubbleMenu.items : undefined);
  const isAllowed = (item: string) => {
    const allowedByBubbleMenu = !allowedItems || allowedItems.includes(item);
    if (!allowedByBubbleMenu) return false;
    
    // Deep block check
    if (item === 'bold' && features?.bold === false) return false;
    if (item === 'italic' && features?.italic === false) return false;
    if (item === 'underline' && features?.underline === false) return false;
    if (item === 'strike' && features?.strike === false) return false;
    if (item === 'link' && features?.link === false) return false;
    if (item === 'color' && features?.textColor === false) return false;
    
    return true;
  };

  const handleDuplicate = () => {
    const { selection } = editor.state;
    const { $from } = selection;
    const currentBlock = $from.node(1);
    if (currentBlock) {
      const pos = $from.end(1);
      editor.chain().focus().insertContentAt(pos, currentBlock.toJSON()).run();
    }
  };

  const handleDelete = () => {
    const { selection } = editor.state;
    const { $from } = selection;
    const pos = $from.before(1);
    const end = $from.after(1);
    editor.chain().focus().deleteRange({ from: pos, to: end }).run();
  };

  const handleTurnInto = (type: string) => {
    if (type === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (type === 'h1' && features?.heading !== false) {
      editor.chain().focus().setNode('heading', { level: 1 }).run();
    } else if (type === 'h2' && features?.heading !== false) {
      editor.chain().focus().setNode('heading', { level: 2 }).run();
    } else if (type === 'h3' && features?.heading !== false) {
      editor.chain().focus().setNode('heading', { level: 3 }).run();
    } else if (type === 'bulletList' && features?.list !== false) {
      editor.chain().focus().toggleBulletList().run();
    } else if (type === 'orderedList' && features?.list !== false) {
      editor.chain().focus().toggleOrderedList().run();
    }
    setShowTurnIntoMenu(false);
  };

  const availableTurnIntoOptions = TURN_INTO_OPTIONS.filter(opt => {
    if (opt.value === 'paragraph') return true;
    if (opt.value.startsWith('h') && features?.heading === false) return false;
    if ((opt.value === 'bulletList' || opt.value === 'orderedList') && features?.list === false) return false;
    return true;
  });

  const handleTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorMenu(false);
  };

  const handleBgColor = (bgColor: string) => {
    if (bgColor === 'transparent') {
      editor.chain().focus().unsetMark('textStyle').run();
    } else {
      editor.chain().focus().setMark('textStyle', { backgroundColor: bgColor }).run();
    }
    setShowColorMenu(false);
  };

  const shouldShow = ({ state }: any) => {
    const { selection } = state;
    const isNodeSelection = 'node' in selection;
    return !selection.empty && !isNodeSelection;
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      className="flex items-center gap-1 axiom-bg-card border axiom-border rounded-xl shadow-2xl p-1.5 backdrop-blur-md axiom-text text-xs font-medium z-50 select-none"
    >
      {isAllowed('turnInto') && (
        <>
          <div className="relative">
            <button
              onClick={() => {
                setShowTurnIntoMenu(!showTurnIntoMenu);
                setShowColorMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-black/20 axiom-text-muted hover:axiom-text transition-colors"
              title="Turn Block Into"
            >
              <span>Turn Into</span>
              <ChevronDown size={12} />
            </button>

            {showTurnIntoMenu && (
              <div className="absolute left-0 top-full mt-1.5 axiom-bg-card border axiom-border rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 w-36 z-50">
                {availableTurnIntoOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleTurnInto(opt.value)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-black/20 axiom-text-muted hover:axiom-text text-xs transition-colors"
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {(isAllowed('bold') || isAllowed('italic') || isAllowed('underline') || isAllowed('strike') || isAllowed('link')) && (
        <div className="w-px h-4 axiom-border-separator mx-1" />
      )}

      {isAllowed('bold') && (
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors hover:bg-black/20 ${editor.isActive('bold') ? 'axiom-button-active' : 'axiom-button-inactive'}`}
          title="Bold"
        >
          <Bold size={13} />
        </button>
      )}

      {isAllowed('italic') && (
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors hover:bg-black/20 ${editor.isActive('italic') ? 'axiom-button-active' : 'axiom-button-inactive'}`}
          title="Italic"
        >
          <Italic size={13} />
        </button>
      )}

      {isAllowed('underline') && (
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors hover:bg-black/20 ${editor.isActive('underline') ? 'axiom-button-active' : 'axiom-button-inactive'}`}
          title="Underline"
        >
          <Underline size={13} />
        </button>
      )}

      {isAllowed('strike') && (
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors hover:bg-black/20 ${editor.isActive('strike') ? 'axiom-button-active' : 'axiom-button-inactive'}`}
          title="Strikethrough"
        >
          <Strikethrough size={13} />
        </button>
      )}

      {isAllowed('color') && (
        <div className="relative">
          <button
            onClick={() => {
              setShowColorMenu(!showColorMenu);
              setShowTurnIntoMenu(false);
            }}
            className="p-1.5 rounded-lg transition-colors hover:bg-black/20 axiom-text-muted hover:axiom-text"
            title="Text & Highlight Color"
          >
            <Palette size={13} />
          </button>

          {showColorMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 axiom-bg-card border axiom-border rounded-xl shadow-2xl p-2.5 flex flex-col gap-2.5 w-44 z-50 text-left">
              {/* Text Colors */}
              <div>
                <span className="text-[9px] font-bold axiom-text-muted uppercase tracking-wider block px-1 mb-1.5">Text Color</span>
                <div className="grid grid-cols-6 gap-1">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleTextColor(color.value)}
                      className="w-5 h-5 rounded-full border axiom-border cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                      style={{ backgroundColor: color.value === '#e4e4e7' ? 'var(--axiom-bg)' : 'transparent' }}
                      title={color.name}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.value }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Highlights */}
              <div>
                <span className="text-[9px] font-bold axiom-text-muted uppercase tracking-wider block px-1 mb-1.5">Highlight</span>
                <div className="grid grid-cols-6 gap-1">
                  {BG_COLORS.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => handleBgColor(bg.value)}
                      className="w-5 h-5 rounded border axiom-border cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 transition-transform axiom-bg"
                      title={bg.name}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded border border-white/10" 
                        style={{ backgroundColor: bg.value === 'transparent' ? '#ff5f56' : bg.value }} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(isAllowed('duplicate') || isAllowed('delete')) && (
        <div className="w-px h-4 axiom-border-separator mx-1" />
      )}

      {isAllowed('duplicate') && (
        <button
          onClick={handleDuplicate}
          className="p-1.5 rounded-lg transition-colors hover:bg-black/20 axiom-text-muted hover:axiom-text"
          title="Duplicate Block"
        >
          <Copy size={13} />
        </button>
      )}

      {isAllowed('delete') && (
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg transition-colors hover:bg-black/20 axiom-text-muted hover:text-red-500"
          title="Delete Block"
        >
          <Trash2 size={13} />
        </button>
      )}
    </BubbleMenu>
  );
};