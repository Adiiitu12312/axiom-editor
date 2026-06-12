import React, { useEffect, useRef, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Type, Layout, Trash2, AlignLeft, AlignCenter, AlignRight, Maximize, Minus, Plus } from 'lucide-react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
        createTweet?: (tweetId: string, element: HTMLElement, options: object) => Promise<HTMLElement>;
      };
    };
  }
}

export const TweetNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, selected, editor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isEditingSize, setIsEditingSize] = useState(false);

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

  const align = node.attrs.align || 'center';
  const url = node.attrs.url || '';
  const width = node.attrs.width || '100%';
  const caption = node.attrs.caption || '';
  const captionPosition = node.attrs.captionPosition || 'below';
  const alt = node.attrs.alt || '';
  
  let tweetId = node.attrs.tweetId;
  if (!tweetId && url) {
    const tweetMatch = url.match(/status\/(\d+)/);
    tweetId = tweetMatch ? tweetMatch[1] : '';
  }

  const [prevAttrs, setPrevAttrs] = useState({ tweetId, align });

  if (tweetId !== prevAttrs.tweetId || align !== prevAttrs.align) {
    setPrevAttrs({ tweetId, align });
    setIsLoaded(false);
  }

  useEffect(() => {
    if (!window.twttr) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
      script.setAttribute('async', 'true');
      script.setAttribute('charset', 'utf-8');
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (!tweetId) return;

    const interval = setInterval(() => {
      if (window.twttr?.widgets) {
        clearInterval(interval);
        clearTimeout(timeout);
        if (containerRef.current && active) {
          containerRef.current.innerHTML = ''; 
          window.twttr.widgets.createTweet?.(tweetId, containerRef.current, {
            theme: 'dark',
            align: align || 'center',
            dnt: true
          })?.then(() => {
            if (active) setIsLoaded(true);
          });
        }
      }
    }, 100);

    const timeout = setTimeout(() => {
      active = false;
      clearInterval(interval);
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [tweetId, align]);

  let containerClass = "w-full relative my-8 flex flex-col outline-none group cursor-pointer ";
  if (align === 'left') containerClass += "items-start mr-auto ml-0";
  else if (align === 'right') containerClass += "items-end ml-auto mr-0";
  else containerClass += "items-center mx-auto";


  return (
    <NodeViewWrapper className={containerClass}>

      {caption && captionPosition === 'above' && (
        <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}

      <div 
        style={{ width: width, maxWidth: '550px', minWidth: '250px' }}
        className={`relative py-4 flex items-center justify-center min-h-[150px] overflow-hidden bg-obsidian border border-smoke/30 rounded-xl transition-all ${selected ? 'ring-4 ring-amber ring-offset-4 ring-offset-obsidian' : ''}`}
        title={alt}
      >
        {editor.isEditable && <div className="absolute inset-0 z-10 cursor-pointer" title="Click to edit embed"></div>}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-steel animate-pulse uppercase tracking-wider font-semibold">
            Establishing connection to X...
          </div>
        )}
        <div ref={containerRef} className={`w-full flex justify-center ${editor.isEditable ? 'pointer-events-none' : ''}`} />
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
            <div className="flex items-center px-2 py-1 gap-1 bg-obsidian border border-smoke/50 rounded-lg">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSizeVal(prev => {
                    const step = prev.unit === '%' ? 5 : 50;
                    const next = Math.max(prev.unit === '%' ? 10 : 250, prev.num - step);
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
                      num = Math.max(250, Math.min(550, num));
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
                    const next = Math.min(prev.unit === '%' ? 100 : 550, prev.num + step);
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
                    num: prev.unit === '%' ? Math.round(prev.num * 5.5) : Math.round(prev.num / 5.5),
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
                    num = Math.max(250, Math.min(550, num));
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
 
 
 