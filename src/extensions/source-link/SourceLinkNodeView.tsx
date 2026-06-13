import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Link, Trash2, Plus, X, ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '../../utils';

interface Source {
  name: string;
  url: string;
}

export const SourceLinkNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, selected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newSrcName, setNewSrcName] = useState('');
  const [newSrcUrl, setNewSrcUrl] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const sources: Source[] = node.attrs.sources || [];
  const color = node.attrs.color || '#e4e4e7';
  const bgColor = node.attrs.bgColor || '#1f1f23cc';

  const togglePopover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const getFaviconUrl = (urlStr: string) => {
    try {
      const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return `https://www.google.com/s2/favicons?sz=64&domain=${url.hostname}`;
    } catch {
      return '';
    }
  };

  const addSource = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newSrcName.trim() || !newSrcUrl.trim()) return;

    // Basic URL parsing/sanitization
    let formattedUrl = newSrcUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const updated = [...sources, { name: newSrcName.trim(), url: formattedUrl }];
    updateAttributes({ sources: updated });
    setNewSrcName('');
    setNewSrcUrl('');
  };

  const removeSource = (index: number) => {
    const updated = sources.filter((_, i) => i !== index);
    updateAttributes({ sources: updated });
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '9999px',
    backgroundColor: bgColor,
    color: color,
    border: 'none',
    fontSize: '12px',
    fontWeight: 500,
    userSelect: 'none',
    cursor: 'pointer',
    verticalAlign: 'middle',
    lineHeight: '1.2',
    boxShadow: selected ? `0 0 0 1.5px ${color}` : 'none',
  };

  const faviconStyle: React.CSSProperties = {
    width: '14px',
    height: '14px',
    minWidth: '14px',
    minHeight: '14px',
    maxWidth: '14px',
    maxHeight: '14px',
    borderRadius: '50%',
    objectFit: 'contain',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
    display: 'inline-block',
  };

  return (
    <NodeViewWrapper as="span" className="inline relative" style={{ whiteSpace: 'normal', verticalAlign: 'middle' }}>
      <span
        onClick={togglePopover}
        style={pillStyle}
        className="axiom-source-link-pill transition-all hover:scale-[1.03] active:scale-[0.98]"
      >
        {sources.length > 0 ? (
          <>
            {sources.length === 1 && getFaviconUrl(sources[0].url) ? (
              <img
                src={getFaviconUrl(sources[0].url)}
                alt=""
                className="axiom-source-link-favicon"
                style={faviconStyle}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <Link style={{ width: '12px', height: '12px', flexShrink: 0, color: color }} />
            )}
            <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sources[0].name || 'Source'}
            </span>
            {sources.length > 1 && (
              <span 
                style={{ 
                  fontSize: '9px', 
                  fontWeight: 'bold', 
                  backgroundColor: color ? `${color}20` : 'rgba(245,158,11,0.2)', 
                  color: color || '#f59e0b', 
                  padding: '1px 4px', 
                  borderRadius: '9999px',
                  lineHeight: '1',
                  flexShrink: 0 
                }}
              >
                +{sources.length - 1}
              </span>
            )}
          </>
        ) : (
          <>
            <Link style={{ width: '12px', height: '12px', flexShrink: 0 }} />
            <span>Add Source</span>
          </>
        )}
      </span>

      {isOpen && (
        <span
          ref={popoverRef}
          className="absolute left-0 top-full mt-2 z-50 w-72 bg-charcoal border border-smoke rounded-xl shadow-2xl p-4 flex flex-col gap-3 text-left font-sans select-text cursor-default leading-normal"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="flex items-center justify-between border-b border-smoke/30 pb-2">
            <span className="font-semibold text-xs text-steel uppercase tracking-wider">Citation Sources</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-steel hover:text-bone transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </span>

          {/* Sources List */}
          <span className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
            {sources.map((src, index) => (
              <span key={index} className="flex items-center justify-between bg-obsidian border border-smoke/20 rounded-lg p-2 gap-2 text-xs">
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-bone truncate">{src.name}</span>
                  <span className="text-[10px] text-steel truncate">{src.url}</span>
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <a
                    href={sanitizeUrl(src.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-steel hover:text-amber transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => removeSource(index)}
                    className="p-1 text-steel hover:text-red-400 transition-colors"
                    title="Delete source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              </span>
            ))}
            {sources.length === 0 && (
              <span className="text-xs text-steel italic text-center py-2">No sources added yet.</span>
            )}
          </span>

          {/* Add Source Form */}
          <span className="flex flex-col gap-2 pt-2 border-t border-smoke/30">
            <span className="text-[10px] font-bold text-steel uppercase tracking-wider">Add New Source</span>
            <span className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Source Name (e.g. Wikipedia)"
                value={newSrcName}
                onChange={(e) => setNewSrcName(e.target.value)}
                className="bg-obsidian border border-smoke/50 rounded-lg px-2.5 py-1.5 text-xs text-bone focus:outline-none focus:border-amber w-full"
              />
              <input
                type="text"
                placeholder="URL (e.g. https://wikipedia.org)"
                value={newSrcUrl}
                onChange={(e) => setNewSrcUrl(e.target.value)}
                className="bg-obsidian border border-smoke/50 rounded-lg px-2.5 py-1.5 text-xs text-bone focus:outline-none focus:border-amber w-full"
              />
              <button
                onClick={addSource}
                className="w-full flex items-center justify-center gap-1.5 bg-amber hover:bg-amber/90 text-charcoal font-semibold text-xs py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Add Source
              </button>
            </span>
          </span>

          {/* Citation Colors */}
          <span className="flex flex-col gap-2 pt-2 border-t border-smoke/30">
            <span className="text-[10px] font-bold text-steel uppercase tracking-wider">Citation Colors</span>
            <span className="flex gap-2">
              <span className="flex-1 flex flex-col gap-1">
                <span className="text-[9px] text-steel">Text / Accent</span>
                <input
                  type="text"
                  placeholder="#e4e4e7"
                  value={color}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('#')) {
                      val = '#' + val.replace(/#/g, '');
                    } else {
                      val = '#' + val.substring(1).replace(/#/g, '');
                    }
                    if (val.length <= 9) {
                      updateAttributes({ color: val });
                    }
                  }}
                  className="bg-obsidian border border-smoke/50 rounded-lg px-2 py-1 text-xs text-bone focus:outline-none focus:border-amber w-full font-mono"
                />
              </span>
              <span className="flex-1 flex flex-col gap-1">
                <span className="text-[9px] text-steel">Background</span>
                <input
                  type="text"
                  placeholder="#1f1f23cc"
                  value={bgColor}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('#')) {
                      val = '#' + val.replace(/#/g, '');
                    } else {
                      val = '#' + val.substring(1).replace(/#/g, '');
                    }
                    if (val.length <= 9) {
                      updateAttributes({ bgColor: val });
                    }
                  }}
                  className="bg-obsidian border border-smoke/50 rounded-lg px-2 py-1 text-xs text-bone focus:outline-none focus:border-amber w-full font-mono"
                />
              </span>
            </span>
          </span>

          {/* Remove node button */}
          <button
            onClick={() => deleteNode()}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider border-t border-smoke/30 pt-2 text-center w-full transition-colors mt-1 bg-transparent border-0 cursor-pointer"
          >
            Remove Citation
          </button>
        </span>
      )}
    </NodeViewWrapper>
  );
};
 