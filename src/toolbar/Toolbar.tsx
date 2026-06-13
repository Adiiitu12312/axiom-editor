import React, { useState, useRef, useEffect } from 'react';
import { 
  Undo, Redo, Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Highlighter, Link as LinkIcon, Quote, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, CheckCircle2, CloudUpload, ImagePlus,
  Video as YoutubeIcon, MessageSquare as Twitter, Camera as Instagram, MessageSquareWarning, Code, CheckSquare, BarChart3, Sparkles
} from 'lucide-react';
import { useAxiomEditor } from '../core/AxiomEditorContext';
import { ToolbarButton } from './ToolbarButton';

export const AxiomToolbar: React.FC = () => {
  const { editor, features, isSaved, setMediaModalOpen, setMediaModalType, setMediaModalInput, sidebarOpen, setSidebarOpen } = useAxiomEditor();
  const [textColorOpen, setTextColorOpen] = useState(false);
  const textColorRef = useRef<HTMLDivElement>(null);

  const [underlineColorOpen, setUnderlineColorOpen] = useState(false);
  const underlineColorRef = useRef<HTMLDivElement>(null);

  const [strikeColorOpen, setStrikeColorOpen] = useState(false);
  const strikeColorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textColorRef.current && !textColorRef.current.contains(event.target as Node)) setTextColorOpen(false);
      if (underlineColorRef.current && !underlineColorRef.current.contains(event.target as Node)) setUnderlineColorOpen(false);
      if (strikeColorRef.current && !strikeColorRef.current.contains(event.target as Node)) setStrikeColorOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor || features?.toolbar === false) return null;

  const shouldShow = (key: string) => {
    if (typeof features?.toolbar === 'object' && Array.isArray(features.toolbar.items)) {
      return features.toolbar.items.includes(key);
    }
    return true; // Default show all if true or undefined
  };

  const insertMedia = (type: 'link' | 'video' | 'tweet' | 'instagram') => {
    if (type === 'link' && features?.link === false) return;
    if (type !== 'link' && features?.embeds === false) return;
    setMediaModalInput('');
    setMediaModalType(type);
    setMediaModalOpen(true);
  };

  const handleImageClick = () => {
    if (features?.image === false) return;
    const position = editor.state.selection.from;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        window.dispatchEvent(new CustomEvent('axiom-image-upload', { detail: { file, position } }));
      }
    };
    input.click();
  };

  const embedsEnabled = features?.embeds !== false;
  const embedConfig = typeof features?.embeds === 'object' ? features.embeds : {};

  return (
    <div className="-mx-1 px-1 mb-2">
      <div className="axiom-toolbar-main shadow-xl shadow-black/20 axiom-bg axiom-border">
        
        {/* Undo/Redo */}
        <div className="axiom-toolbar-group">
          {shouldShow('undo') && features?.undo !== false && <ToolbarButton icon={<Undo className="w-4 h-4" />} title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />}
          {shouldShow('redo') && features?.redo !== false && <ToolbarButton icon={<Redo className="w-4 h-4" />} title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />}
        </div>

        <div className="w-px h-6 axiom-border-separator hidden sm:block" />

        {/* Formatting */}
        <div className="axiom-toolbar-group">
          {shouldShow('bold') && features?.bold !== false && <ToolbarButton icon={<Bold className="w-4 h-4" />} title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />}
          {shouldShow('italic') && features?.italic !== false && <ToolbarButton icon={<Italic className="w-4 h-4" />} title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />}
          {/* Underline Color Dropdown */}
          {shouldShow('underline') && features?.underline !== false && (
            <div ref={underlineColorRef} className="relative">
              <ToolbarButton 
                icon={<UnderlineIcon className="w-4 h-4" />} 
                title="Underline" 
                active={editor.isActive('underline')} 
                onClick={() => {
                  if (editor.isActive('underline')) {
                    (editor.chain().focus() as any).unsetUnderline().run();
                  } else {
                    setUnderlineColorOpen(!underlineColorOpen);
                  }
                }} 
              />
              {underlineColorOpen && (
                <div className="absolute top-full left-0 mt-2 p-3 rounded-xl shadow-2xl grid grid-cols-4 gap-2 z-30 min-w-[120px] axiom-bg-card axiom-border">
                  {['#f9761f', '#ffffff', '#94a3b8', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#eab308'].map(color => (
                    <button
                      key={color} type="button"
                      onClick={() => { (editor.chain().focus() as any).setUnderline({ color }).run(); setUnderlineColorOpen(false); }}
                      className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                      style={{ backgroundColor: color }} title={color}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => { (editor.chain().focus() as any).unsetUnderline().run(); setUnderlineColorOpen(false); }}
                    className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-transparent cursor-pointer text-red-500 font-bold text-xs"
                    title="Remove Underline"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    /
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Strike Color Dropdown */}
          {shouldShow('strike') && features?.strike !== false && (
            <div ref={strikeColorRef} className="relative">
              <ToolbarButton 
                icon={<Strikethrough className="w-4 h-4" />} 
                title="Strikethrough" 
                active={editor.isActive('strike')} 
                onClick={() => {
                  if (editor.isActive('strike')) {
                    (editor.chain().focus() as any).unsetStrike().run();
                  } else {
                    setStrikeColorOpen(!strikeColorOpen);
                  }
                }} 
              />
              {strikeColorOpen && (
                <div className="absolute top-full left-0 mt-2 p-3 rounded-xl shadow-2xl grid grid-cols-4 gap-2 z-30 min-w-[120px] axiom-bg-card axiom-border">
                  {['#f9761f', '#ffffff', '#94a3b8', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#eab308'].map(color => (
                    <button
                      key={color} type="button"
                      onClick={() => { (editor.chain().focus() as any).setStrike({ color }).run(); setStrikeColorOpen(false); }}
                      className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                      style={{ backgroundColor: color }} title={color}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => { (editor.chain().focus() as any).unsetStrike().run(); setStrikeColorOpen(false); }}
                    className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-transparent cursor-pointer text-red-500 font-bold text-xs"
                    title="Remove Strikethrough"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    /
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text Color Dropdown */}
          {shouldShow('textColor') && features?.textColor !== false && (
            <div ref={textColorRef} className="relative">
              <ToolbarButton 
                icon={<Highlighter className="w-4 h-4" />} 
                title="Text Color" 
                active={!!editor.getAttributes('textStyle').color} 
                onClick={() => {
                  if (editor.getAttributes('textStyle').color) {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    setTextColorOpen(!textColorOpen);
                  }
                }} 
              />
              {textColorOpen && (
                <div className="absolute top-full left-0 mt-2 p-3 rounded-xl shadow-2xl grid grid-cols-4 gap-2 z-30 min-w-[120px] axiom-bg-card axiom-border">
                  {['#f9761f', '#ffffff', '#94a3b8', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#eab308'].map(color => (
                    <button
                      key={color} type="button"
                      onClick={() => { editor.chain().focus().setColor(color).run(); setTextColorOpen(false); }}
                      className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                      style={{ backgroundColor: color }} title={color}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => { editor.chain().focus().unsetColor().run(); setTextColorOpen(false); }}
                    className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-transparent cursor-pointer text-red-500 font-bold text-xs"
                    title="Remove Text Color"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    /
                  </button>
                </div>
              )}
            </div>
          )}

          {shouldShow('link') && features?.link !== false && (
            <ToolbarButton 
              icon={<LinkIcon className="w-4 h-4" />} title="Link" active={editor.isActive('link')} 
              onClick={() => editor.getAttributes('link').href ? editor.chain().focus().unsetLink().run() : insertMedia('link')} 
            />
          )}
        </div>

        <div className="w-px h-6 axiom-border-separator hidden sm:block" />

        {/* Blocks */}
        <div className="axiom-toolbar-group">
          {shouldShow('h1') && features?.heading !== false && <ToolbarButton variant="text" label="H1" title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />}
          {shouldShow('h2') && features?.heading !== false && <ToolbarButton variant="text" label="H2" title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />}
          {shouldShow('h3') && features?.heading !== false && <ToolbarButton variant="text" label="H3" title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />}
          {shouldShow('blockquote') && features?.blockquote !== false && <ToolbarButton icon={<Quote className="w-4 h-4" />} title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />}
          {shouldShow('codeBlock') && features?.codeBlock !== false && <ToolbarButton icon={<Code className="w-4 h-4" />} title="Code Block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />}
          
          {shouldShow('callout') && features?.callout !== false && (
            <ToolbarButton icon={<MessageSquareWarning className="w-4 h-4" />} title="Callout" active={editor.isActive('callout')} onClick={() => editor.chain().focus().insertContent({ type: 'callout', content: [{ type: 'paragraph' }] }).run()} />
          )}
        </div>

        <div className="w-px h-6 axiom-border-separator hidden sm:block" />

        {/* Lists & Alignment */}
        <div className="axiom-toolbar-group">
          {shouldShow('bulletList') && features?.list !== false && <ToolbarButton icon={<List className="w-4 h-4" />} title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />}
          {shouldShow('orderedList') && features?.list !== false && <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />}
          {shouldShow('taskList') && features?.list !== false && <ToolbarButton icon={<CheckSquare className="w-4 h-4" />} title="Task List" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />}
          
          {features?.align !== false && (shouldShow('alignLeft') || shouldShow('alignCenter') || shouldShow('alignRight')) && (
            <div className="w-px h-4 mx-1 axiom-border-separator opacity-30 hidden sm:block" />
          )}
          {shouldShow('alignLeft') && features?.align !== false && <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />}
          {shouldShow('alignCenter') && features?.align !== false && <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />}
          {shouldShow('alignRight') && features?.align !== false && <ToolbarButton icon={<AlignRight className="w-4 h-4" />} title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />}
        </div>

        <div className="w-px h-6 axiom-border-separator hidden md:block" />

        {/* Media & Extras */}
        <div className="axiom-toolbar-group">
          {shouldShow('image') && features?.image !== false && (
            <ToolbarButton icon={<ImagePlus className="w-4 h-4" />} label="Image" title="Insert Image" onClick={handleImageClick} />
          )}
          
          {shouldShow('video') && embedsEnabled && embedConfig.youtube !== false && (
            <ToolbarButton icon={<YoutubeIcon className="w-4 h-4" />} label="Video" title="Insert Video" onClick={() => insertMedia('video')} />
          )}
          {shouldShow('tweet') && embedsEnabled && embedConfig.tweet !== false && (
            <ToolbarButton icon={<Twitter className="w-4 h-4" />} label="Tweet" title="Insert Tweet" onClick={() => insertMedia('tweet')} />
          )}
          {shouldShow('instagram') && embedsEnabled && embedConfig.instagram !== false && (
            <ToolbarButton icon={<Instagram className="w-4 h-4" />} label="Instagram" title="Insert Instagram" onClick={() => insertMedia('instagram')} />
          )}
          {shouldShow('poll') && features?.poll !== false && (
            <ToolbarButton icon={<BarChart3 className="w-4 h-4" />} label="Poll" title="Insert Poll" onClick={() => editor.chain().focus().insertContent({ type: 'poll' }).run()} />
          )}
          {shouldShow('aiCopilot') && features?.aiCopilot !== false && (
            <ToolbarButton icon={<Sparkles className="w-4 h-4" />} label="AI Docs" title="Open Document AI" active={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} />
          )}
        </div>

        <div className="flex-1 min-w-[20px]" />

        {/* Metrics & Sync Status */}
        <div className="axiom-toolbar-metrics">
          {features?.characterCount !== false && (
            <div className="text-sm font-medium tracking-wide axiom-text-muted hidden sm:block whitespace-nowrap">
              {editor.storage.characterCount?.words() ?? 0} words
            </div>
          )}
          
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-xl border border-white/5 whitespace-nowrap">
            {isSaved ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /><span>Saved</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest axiom-primary-text-muted">
                <CloudUpload className="w-4 h-4 animate-pulse" /><span>Syncing</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
 
 
  