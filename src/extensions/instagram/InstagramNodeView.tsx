import React, { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Type, Layout, Trash2, AlignLeft, AlignCenter, AlignRight, Maximize } from 'lucide-react';
import { normalizeInstagramUrl } from '../../utils';

export const InstagramNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, selected, editor }) => {
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isEditingSize, setIsEditingSize] = useState(false);

  const align = node.attrs.align || 'center';
  const width = node.attrs.width || '100%';
  const caption = node.attrs.caption || '';
  const captionPosition = node.attrs.captionPosition || 'below';
  const alt = node.attrs.alt || '';
  const rawUrl = node.attrs.url || '';
  const url = normalizeInstagramUrl(rawUrl);

  let containerClass = "w-full relative my-8 flex flex-col outline-none group cursor-pointer ";
  if (align === 'left') containerClass += "items-start mr-auto ml-0";
  else if (align === 'right') containerClass += "items-end ml-auto mr-0";
  else containerClass += "items-center mx-auto";

  const handleSizeSubmit = () => {
    let val = String(width || '').trim();
    if (val.endsWith('%')) {
      const num = parseInt(val.replace('%', ''), 10);
      if (!isNaN(num) && num < 30) val = '30%';
    } else {
      const num = parseInt(val.replace('px', ''), 10);
      if (!isNaN(num) && num < 250) val = '250px';
      else if (!isNaN(num) && !val.endsWith('px')) val = `${num}px`;
    }
    updateAttributes({ width: val });
    setIsEditingSize(false);
  };

  return (
    <NodeViewWrapper className={containerClass}>

      {caption && captionPosition === 'above' && (
        <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}

      <div style={{ width: width }} className={`w-full max-w-[540px] min-w-[250px] rounded-2xl bg-charcoal/40 border border-smoke/30 p-6 flex flex-col items-center gap-4 transition-all duration-300 relative ${selected ? 'ring-4 ring-amber ring-offset-4 ring-offset-obsidian' : ''}`} title={alt}>
        {editor.isEditable && <div className="absolute inset-0 z-10 cursor-pointer" title="Click to edit embed"></div>}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-lg shadow-pink-500/10 ${editor.isEditable ? 'pointer-events-none' : ''}`}>
          <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </div>
        <div className="text-center space-y-1.5 w-full">
          <span className="text-[10px] text-amber uppercase tracking-widest font-bold">Instagram Embed</span>
          <h4 className="text-sm font-semibold text-bone truncate max-w-xs mx-auto" title={url}>{url}</h4>
          <p className="text-[11px] text-steel max-w-[280px] mx-auto leading-relaxed">Browser cookie blocking is active in localhost. This embed will hydrate and load beautifully on your live secure HTTPS site!</p>
        </div>
      </div>

      {caption && captionPosition === 'below' && (
        <p className="text-steel text-xs md:text-sm italic mt-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}

      {selected && (
        <div 
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 bg-charcoal border border-smoke rounded-xl shadow-2xl flex items-center divide-x divide-smoke/30 h-11 px-1"
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {isEditingAlt ? (
            <div className="flex items-center px-2 py-1 gap-2">
              <input type="text" autoFocus placeholder="Alt text / Title..." value={alt} onChange={(e) => updateAttributes({ alt: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingAlt(false); }} className="bg-obsidian border border-smoke/50 rounded-lg px-3 py-1 text-xs text-bone focus:outline-none focus:border-amber w-40" />
              <button onMouseDown={(e) => { e.preventDefault(); setIsEditingAlt(false); }} className="text-[10px] text-amber uppercase font-bold px-1">Done</button>
            </div>
          ) : isEditingCaption ? (
            <div className="flex items-center px-2 py-1 gap-2">
              <input type="text" autoFocus placeholder="Caption..." value={caption} onChange={(e) => updateAttributes({ caption: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingCaption(false); }} className="bg-obsidian border border-smoke/50 rounded-lg px-3 py-1 text-xs text-bone focus:outline-none focus:border-amber w-40" />
              <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ captionPosition: captionPosition === 'above' ? 'below' : 'above' }) }} className="p-1.5 text-steel hover:text-amber rounded" title="Toggle Position"><Layout className="w-3.5 h-3.5" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); setIsEditingCaption(false); }} className="text-[10px] text-amber uppercase font-bold px-1">Done</button>
            </div>
          ) : isEditingSize ? (
            <div className="flex items-center px-2 py-1 gap-2">
              <input type="text" autoFocus placeholder="Size (px or %)..." value={width} onChange={(e) => updateAttributes({ width: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') handleSizeSubmit(); }} className="bg-obsidian border border-smoke/50 rounded-lg px-3 py-1 text-xs text-bone focus:outline-none focus:border-amber w-32" />
              <button onMouseDown={(e) => { e.preventDefault(); handleSizeSubmit(); }} className="text-[10px] text-amber uppercase font-bold px-1">Done</button>
            </div>
          ) : (
            <>
              <div className="flex px-1 items-center gap-0.5">
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ width: '100%' }) }} className="p-2 text-bone hover:text-amber rounded-lg transition-all" title="Full Width"><Maximize className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); setIsEditingSize(true) }} className="text-[10px] font-bold text-bone hover:text-amber px-2 py-1 transition-all">Size</button>
              </div>
              <div className="flex px-1 items-center gap-0.5">
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'left' }) }} className="p-2 text-bone hover:text-amber rounded-lg transition-colors"><AlignLeft className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'center' }) }} className="p-2 text-bone hover:text-amber rounded-lg transition-colors"><AlignCenter className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'right' }) }} className="p-2 text-bone hover:text-amber rounded-lg transition-colors"><AlignRight className="w-4 h-4" /></button>
              </div>
              <div className="flex px-1 items-center gap-0.5">
                <button onMouseDown={(e) => { e.preventDefault(); setIsEditingCaption(true) }} className="p-2 text-bone hover:text-amber rounded-lg transition-colors" title="Caption"><Type className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); setIsEditingAlt(true) }} className="p-2 text-bone hover:text-amber rounded-lg transition-colors" title="Alt Text / Title">Alt</button>
                <button onMouseDown={(e) => { e.preventDefault(); deleteNode() }} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};
