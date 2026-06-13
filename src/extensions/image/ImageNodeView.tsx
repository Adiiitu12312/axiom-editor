import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Type, Layout, Trash2, AlignLeft, AlignCenter, AlignRight, Maximize, Minus, Plus } from 'lucide-react';
import { sanitizeUrl } from '../../utils';

export const ImageNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, selected }) => {
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isEditingSize, setIsEditingSize] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const [sizeVal, setSizeVal] = useState(() => {
    const match = String(node.attrs.width || '100%').match(/^(\d+)(%|px)$/);
    return match ? { num: parseInt(match[1], 10), unit: match[2] as '%' | 'px' } : { num: 100, unit: '%' as const };
  });

  useEffect(() => {
    const match = String(node.attrs.width || '100%').match(/^(\d+)(%|px)$/);
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSizeVal({ num: parseInt(match[1], 10), unit: match[2] as '%' | 'px' });
    }
  }, [node.attrs.width]);
  const containerRef = useRef<HTMLDivElement>(null);

  const align = node.attrs.align || 'center';
  const width = node.attrs.width || '100%';
  const caption = node.attrs.caption || '';
  const captionPosition = node.attrs.captionPosition || 'below';
  const alt = node.attrs.alt || '';
  const src = node.attrs.src;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = Math.max(150, e.clientX - rect.left);
    updateAttributes({ width: `${newWidth}px` });
  }, [isResizing, updateAttributes]);

  const onMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, onMouseMove, onMouseUp]);
  let containerClass = "w-full relative my-8 flex flex-col outline-none group cursor-pointer ";
  if (align === 'left') containerClass += "items-start mr-auto ml-0";
  else if (align === 'right') containerClass += "items-end ml-auto mr-0";
  else containerClass += "items-center mx-auto";

  const className = `rounded-xl shadow-2xl transition-all border border-smoke/30 max-w-full ${selected ? 'ring-4 ring-amber ring-offset-4 ring-offset-obsidian' : ''}`;

  return (
    <NodeViewWrapper className={containerClass}>
      <div ref={containerRef} className="relative inline-block" style={{ width, minWidth: '150px' }}>
        {caption && captionPosition === 'above' && (
          <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{caption}</p>
        )}

        <img src={sanitizeUrl(src)} className={className} alt={alt} style={{ width: '100%', display: 'block' }} />

        {/* Drag Handle for Resizing */}
        {selected && (
          <div 
            onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
            className="absolute -right-2 -bottom-2 w-5 h-5 bg-amber border-2 border-charcoal rounded-full cursor-se-resize z-50 hover:scale-125 transition-transform"
            title="Drag to resize"
          />
        )}

        {caption && captionPosition === 'below' && (
          <p className="text-steel text-xs md:text-sm italic mt-3 uppercase tracking-widest font-medium px-2">{caption}</p>
        )}
      </div>

      {selected && (
        <div 
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 bg-charcoal border border-smoke rounded-xl shadow-2xl flex items-center divide-x divide-smoke/30 h-11 px-1"
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {isEditingAlt ? (
            <div className="flex items-center px-2 py-1 gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Alt text / Title..."
                value={alt}
                onChange={(e) => updateAttributes({ alt: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingAlt(false); }}
                className="bg-obsidian border border-smoke/50 rounded-lg px-3 py-1 text-xs text-bone focus:outline-none focus:border-amber w-40"
              />
              <button onMouseDown={(e) => { e.preventDefault(); setIsEditingAlt(false); }} className="text-[10px] text-amber uppercase font-bold px-1">Done</button>
            </div>
          ) : isEditingCaption ? (
            <div className="flex items-center px-2 py-1 gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Caption..."
                value={caption}
                onChange={(e) => updateAttributes({ caption: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingCaption(false); }}
                className="bg-obsidian border border-smoke/50 rounded-lg px-3 py-1 text-xs text-bone focus:outline-none focus:border-amber w-40"
              />
              <button 
                onMouseDown={(e) => { e.preventDefault(); updateAttributes({ captionPosition: captionPosition === 'above' ? 'below' : 'above' }) }}
                className="p-1.5 text-steel hover:text-amber rounded"
                title="Toggle Position"
              >
                <Layout className="w-3.5 h-3.5" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); setIsEditingCaption(false); }} className="text-[10px] text-amber uppercase font-bold px-1">Done</button>
            </div>
          ) : isEditingSize ? (
            <div className="flex items-center px-2 py-1 gap-1 bg-obsidian border border-smoke/50 rounded-lg">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSizeVal(prev => {
                    const step = prev.unit === '%' ? 5 : 50;
                    const next = Math.max(prev.unit === '%' ? 10 : 150, prev.num - step);
                    return { ...prev, num: next };
                  });
                }}
                className="p-1 text-steel hover:text-amber rounded transition-colors"
                title="Decrease Size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                autoFocus
                value={sizeVal.num}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSizeVal(prev => ({ ...prev, num: isNaN(val) ? 0 : val }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const { unit } = sizeVal;
                    let { num } = sizeVal;
                    if (unit === '%') {
                      num = Math.max(10, Math.min(100, num));
                    } else {
                      num = Math.max(150, Math.min(1000, num));
                    }
                    updateAttributes({ width: `${num}${unit}` });
                    setIsEditingSize(false);
                  }
                }}
                className="bg-transparent text-center text-xs text-bone focus:outline-none w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSizeVal(prev => {
                    const step = prev.unit === '%' ? 5 : 50;
                    const next = Math.min(prev.unit === '%' ? 100 : 1000, prev.num + step);
                    return { ...prev, num: next };
                  });
                }}
                className="p-1 text-steel hover:text-amber rounded transition-colors"
                title="Increase Size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSizeVal(prev => ({
                    num: prev.unit === '%' ? Math.round(prev.num * 8) : Math.round(prev.num / 8),
                    unit: prev.unit === '%' ? 'px' : '%'
                  }));
                }}
                className="px-1.5 py-0.5 bg-charcoal border border-smoke/30 rounded text-[10px] font-bold text-amber hover:text-amber/80 transition-colors"
              >
                {sizeVal.unit}
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  const { unit } = sizeVal;
                  let { num } = sizeVal;
                  if (unit === '%') {
                    num = Math.max(10, Math.min(100, num));
                  } else {
                    num = Math.max(150, Math.min(1000, num));
                  }
                  updateAttributes({ width: `${num}${unit}` });
                  setIsEditingSize(false);
                }}
                className="text-[10px] text-amber uppercase font-bold pl-2 border-l border-smoke/30 hover:text-amber/80 transition-colors"
              >
                Done
              </button>
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
 
 
  