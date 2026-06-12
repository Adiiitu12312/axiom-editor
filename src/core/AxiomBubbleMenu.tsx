import React, { useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link as LinkIcon, 
  Sparkles, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Palette
} from 'lucide-react';
import { useAxiomEditor } from './AxiomEditorContext';

interface AxiomBubbleMenuProps {
  editor: Editor;
  onAskAI?: (text: string) => void;
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
  { name: 'Ordered List', value: 'orderedList' },
  { name: 'Code Block', value: 'codeBlock' },
  { name: 'Callout', value: 'callout' }
];

export const AxiomBubbleMenu: React.FC<AxiomBubbleMenuProps> = ({ editor, onAskAI }) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showTurnIntoMenu, setShowTurnIntoMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const { features } = useAxiomEditor();

  if (!editor || features?.bubbleMenu === false) return null;

  const allowedItems = typeof features?.bubbleMenu === 'object' ? features.bubbleMenu.items : undefined;
  const isAllowed = (item: string) => !allowedItems || allowedItems.includes(item);

  // Duplicate current selected block
  const handleDuplicate = () => {
    const { selection } = editor.state;
    const { $from } = selection;
    const currentBlock = $from.node(1);
    if (currentBlock) {
      const pos = $from.end(1);
      editor.chain().focus().insertContentAt(pos, currentBlock.toJSON()).run();
    }
  };

  // Delete current selected block
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
    } else if (type === 'h1') {
      editor.chain().focus().setNode('heading', { level: 1 }).run();
    } else if (type === 'h2') {
      editor.chain().focus().setNode('heading', { level: 2 }).run();
    } else if (type === 'h3') {
      editor.chain().focus().setNode('heading', { level: 3 }).run();
    } else if (type === 'bulletList') {
      editor.chain().focus().toggleBulletList().run();
    } else if (type === 'orderedList') {
      editor.chain().focus().toggleOrderedList().run();
    } else if (type === 'codeBlock') {
      editor.chain().focus().toggleCodeBlock().run();
    } else if (type === 'callout') {
      editor.chain().focus().insertContent({
        type: 'callout',
        content: [{ type: 'paragraph' }]
      }).run();
    }
    setShowTurnIntoMenu(false);
  };

  // Set link URL
  const handleSetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  };

  // Trigger Ask AI for the current selection text
  const handleAskAIClick = () => {
    const { selection } = editor.state;
    const text = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (onAskAI && text.trim()) {
      onAskAI(text);
    }
  };

  // Set selected text color
  const handleTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorMenu(false);
  };

  // Set selected text highlight background color
  const handleBgColor = (bgColor: string) => {
    if (bgColor === 'transparent') {
      editor.chain().focus().unsetMark('textStyle').run();
    } else {
      editor.chain().focus().setMark('textStyle', { backgroundColor: bgColor }).run();
    }
    setShowColorMenu(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-1 bg-[#141416]/95 border border-smoke/50 rounded-xl shadow-2xl p-1.5 backdrop-blur-md text-bone text-xs font-medium z-50 select-none"
    >
      {showLinkInput ? (
        <form onSubmit={handleSetLink} className="flex items-center gap-2 px-2 py-0.5">
          <input
            type="text"
            placeholder="Paste link (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="bg-[#2a2a32]/60 border border-smoke/30 rounded-md px-2 py-1 text-xs text-bone focus:outline-none focus:border-amber/80 w-44"
            autoFocus
          />
          <button type="submit" className="px-2.5 py-1 bg-amber text-obsidian rounded-md font-semibold text-[11px] hover:bg-amber/90 transition-colors">
            Apply
          </button>
          <button type="button" onClick={() => setShowLinkInput(false)} className="text-steel hover:text-bone text-[11px] px-1">
            Cancel
          </button>
        </form>
      ) : (
        <>
          {/* Ask AI Command */}
          {isAllowed('ai') && onAskAI && (
            <button
              onClick={handleAskAIClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-[#8b5cf6]/10 transition-colors font-semibold select-none"
              title="Ask AI"
            >
              <Sparkles size={13} className="animate-pulse" />
              <span>Ask AI</span>
            </button>
          )}

          {isAllowed('turnInto') && (
            <>
              <div className="w-px h-4 bg-smoke/25 mx-1" />
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTurnIntoMenu(!showTurnIntoMenu);
                    setShowColorMenu(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-charcoal/50 text-steel hover:text-bone transition-colors"
                  title="Turn Block Into"
                >
                  <span>Turn Into</span>
                  <ChevronDown size={12} />
                </button>

                {showTurnIntoMenu && (
                  <div className="absolute left-0 top-full mt-1.5 bg-[#141416] border border-smoke/50 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 w-36 z-50">
                    {TURN_INTO_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleTurnInto(opt.value)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-charcoal/50 text-steel hover:text-bone text-xs transition-colors"
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
            <div className="w-px h-4 bg-smoke/25 mx-1" />
          )}

          {isAllowed('bold') && (
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 ${editor.isActive('bold') ? 'text-amber' : 'text-steel hover:text-bone'}`}
              title="Bold"
            >
              <Bold size={13} />
            </button>
          )}

          {isAllowed('italic') && (
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 ${editor.isActive('italic') ? 'text-amber' : 'text-steel hover:text-bone'}`}
              title="Italic"
            >
              <Italic size={13} />
            </button>
          )}

          {isAllowed('underline') && (
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 ${editor.isActive('underline') ? 'text-amber' : 'text-steel hover:text-bone'}`}
              title="Underline"
            >
              <Underline size={13} />
            </button>
          )}

          {isAllowed('strike') && (
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 ${editor.isActive('strike') ? 'text-amber' : 'text-steel hover:text-bone'}`}
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>
          )}

          {isAllowed('link') && (
            <button
              onClick={() => {
                setShowLinkInput(true);
                setShowColorMenu(false);
                setShowTurnIntoMenu(false);
              }}
              className={`p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 ${editor.isActive('link') ? 'text-amber' : 'text-steel hover:text-bone'}`}
              title="Hyperlink"
            >
              <LinkIcon size={13} />
            </button>
          )}

          {isAllowed('color') && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowColorMenu(!showColorMenu);
                  setShowTurnIntoMenu(false);
                }}
                className="p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 text-steel hover:text-bone"
                title="Text & Highlight Color"
              >
                <Palette size={13} />
              </button>

              {showColorMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 bg-[#141416] border border-smoke/50 rounded-xl shadow-2xl p-2.5 flex flex-col gap-2.5 w-44 z-50 text-left">
                  {/* Text Colors */}
                  <div>
                    <span className="text-[9px] font-bold text-steel uppercase tracking-wider block px-1 mb-1.5">Text Color</span>
                    <div className="grid grid-cols-6 gap-1">
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleTextColor(color.value)}
                          className="w-5 h-5 rounded-full border border-smoke/20 cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                          style={{ backgroundColor: color.value === '#e4e4e7' ? '#1c1c1f' : 'transparent' }}
                          title={color.name}
                        >
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.value }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Highlights */}
                  <div>
                    <span className="text-[9px] font-bold text-steel uppercase tracking-wider block px-1 mb-1.5">Highlight</span>
                    <div className="grid grid-cols-6 gap-1">
                      {BG_COLORS.map((bg) => (
                        <button
                          key={bg.value}
                          onClick={() => handleBgColor(bg.value)}
                          className="w-5 h-5 rounded border border-smoke/20 cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 transition-transform bg-[#1c1c1f]"
                          title={bg.name}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded border border-smoke/10" 
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
            <div className="w-px h-4 bg-smoke/25 mx-1" />
          )}

          {isAllowed('duplicate') && (
            <button
              onClick={handleDuplicate}
              className="p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 text-steel hover:text-bone"
              title="Duplicate Block"
            >
              <Copy size={13} />
            </button>
          )}

          {isAllowed('delete') && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg transition-colors hover:bg-charcoal/50 text-steel hover:text-[#ff5f56]"
              title="Delete Block"
            >
              <Trash2 size={13} />
            </button>
          )}
        </>
      )}
    </BubbleMenu>
  );
};
