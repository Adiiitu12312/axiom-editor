/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { Search, X, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

interface AxiomFindReplaceProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export const AxiomFindReplace: React.FC<AxiomFindReplaceProps> = ({ editor, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editor) return;

    if (!isOpen) {
      // Clean up search on close
      (editor.storage as any).searchAndReplace.searchTerm = '';
      (editor.storage as any).searchAndReplace.currentIndex = 0;
      editor.view.dispatch(editor.state.tr);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm('');
      setReplaceTerm('');
      setTotalMatches(0);
      setCurrentIndex(0);
    }
  }, [isOpen, editor]);

  // Update editor search term and recalculate highlights
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (!editor) return;

    (editor.storage as any).searchAndReplace.searchTerm = val;
    (editor.storage as any).searchAndReplace.currentIndex = 0;
    editor.view.dispatch(editor.state.tr);

    const matches = (editor.storage as any).searchAndReplace.results || [];
    setTotalMatches(matches.length);
    setCurrentIndex(matches.length > 0 ? 1 : 0);
  };

  const navigateMatch = (direction: 'next' | 'prev') => {
    if (!editor || totalMatches === 0) return;

    const storage = (editor.storage as any).searchAndReplace;
    let nextIndex = storage.currentIndex;

    if (direction === 'next') {
      nextIndex = (nextIndex + 1) % totalMatches;
    } else {
      nextIndex = (nextIndex - 1 + totalMatches) % totalMatches;
    }

    storage.currentIndex = nextIndex;
    editor.view.dispatch(editor.state.tr);
    setCurrentIndex(nextIndex + 1);

    // Scroll active match into view
    const activeMatch = storage.results[nextIndex];
    if (activeMatch) {
      try {
        const domEl = editor.view.nodeDOM(activeMatch.from) as HTMLElement;
        if (domEl) {
          domEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          const domAtPos = editor.view.domAtPos(activeMatch.from).node as HTMLElement;
          if (domAtPos) {
            const target = domAtPos.parentElement || domAtPos;
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } catch {
        // Fallback silently if DOM node not accessible
      }
    }
  };

  const handleReplace = () => {
    if (!editor || totalMatches === 0) return;

    const storage = (editor.storage as any).searchAndReplace;
    const activeIdx = storage.currentIndex;
    const activeMatch = storage.results[activeIdx];

    if (activeMatch) {
      editor.chain().focus().insertContentAt({ from: activeMatch.from, to: activeMatch.to }, replaceTerm).run();
      // Re-trigger search to update remaining matches
      handleSearchChange(searchTerm);
    }
  };

  const handleReplaceAll = () => {
    if (!editor || totalMatches === 0) return;

    const storage = (editor.storage as any).searchAndReplace;
    const results = [...(storage.results || [])].reverse();

    let tr = editor.state.tr;
    results.forEach((match) => {
      tr = tr.insertText(replaceTerm, match.from, match.to);
    });

    editor.view.dispatch(tr);
    handleSearchChange(searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-4 right-4 z-50 bg-[#141416]/95 border border-smoke/50 rounded-xl shadow-2xl p-3.5 backdrop-blur-md text-bone flex flex-col gap-2.5 w-72 select-none"
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-smoke/10 pb-2">
        <span className="font-semibold text-xs text-steel flex items-center gap-1.5 font-display">
          <Search size={13} className="text-amber" />
          Find & Replace
        </span>
        <button onClick={onClose} className="text-steel hover:text-bone transition-colors cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* Find Field */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-steel uppercase tracking-wider">Find</label>
        <div className="flex items-center gap-2 bg-[#2a2a32]/60 border border-smoke/30 rounded-md px-2.5 py-1.5 focus-within:border-amber/80 transition-colors">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type search text..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent border-0 p-0 text-xs text-bone focus:outline-none flex-1 min-w-0"
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-steel font-mono">
              {totalMatches > 0 ? `${currentIndex}/${totalMatches}` : '0/0'}
            </span>
            <button 
              onClick={() => navigateMatch('prev')}
              disabled={totalMatches === 0}
              className="p-0.5 hover:bg-charcoal/50 text-steel hover:text-bone disabled:opacity-40 rounded cursor-pointer"
            >
              <ChevronUp size={13} />
            </button>
            <button 
              onClick={() => navigateMatch('next')}
              disabled={totalMatches === 0}
              className="p-0.5 hover:bg-charcoal/50 text-steel hover:text-bone disabled:opacity-40 rounded cursor-pointer"
            >
              <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Replace Field */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-steel uppercase tracking-wider">Replace</label>
        <div className="flex items-center gap-2 bg-[#2a2a32]/60 border border-smoke/30 rounded-md px-2.5 py-1.5 focus-within:border-amber/80 transition-colors">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="bg-transparent border-0 p-0 text-xs text-bone focus:outline-none flex-1 min-w-0"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-smoke/10 mt-1">
        <button
          onClick={handleReplace}
          disabled={totalMatches === 0}
          className="flex-1 py-1.5 bg-[#2a2a32]/60 border border-smoke/30 hover:border-smoke/60 rounded-md text-[11px] font-semibold text-bone hover:text-amber disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={11} />
          Replace
        </button>
        <button
          onClick={handleReplaceAll}
          disabled={totalMatches === 0}
          className="flex-1 py-1.5 bg-amber text-obsidian rounded-md text-[11px] font-semibold hover:bg-amber/90 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          Replace All
        </button>
      </div>
    </div>
  );
};
 