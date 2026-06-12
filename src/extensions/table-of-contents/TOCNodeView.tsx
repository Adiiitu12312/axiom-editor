import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

export const TOCNodeView: React.FC<NodeViewProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState<{ text: string; level: number }[]>([]);

  // Periodically extract headings from editor content to keep outline in sync
  useEffect(() => {
    if (!editor) return;

    const extractHeadings = () => {
      const foundHeadings: { text: string; level: number }[] = [];
      editor.state.doc.descendants((n) => {
        if (n.type.name === 'heading') {
          foundHeadings.push({
            text: n.textContent,
            level: n.attrs.level || 1,
          });
        }
      });
      setHeadings(foundHeadings);
    };

    extractHeadings();
    
    // Bind to editor updates
    editor.on('update', extractHeadings);
    return () => {
      editor.off('update', extractHeadings);
    };
  }, [editor]);

  // Smoothly scroll the page to the selected heading in the DOM
  const handleHeadingClick = (text: string, level: number) => {
    const selector = `h${level}`;
    const domHeadings = document.querySelectorAll(selector);
    for (const domEl of Array.from(domHeadings)) {
      if (domEl.textContent?.trim() === text.trim()) {
        domEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Highlight effect temporarily to guide the eye
        const parent = domEl.parentElement;
        if (parent) {
          parent.classList.add('bg-amber/5');
          setTimeout(() => parent.classList.remove('bg-amber/5'), 1500);
        }
        break;
      }
    }
  };

  return (
    <NodeViewWrapper className="axiom-toc-block my-6 border border-smoke/30 bg-[#1c1c1f]/45 rounded-xl shadow-md overflow-hidden select-none">
      {/* Sticky Dropdown Toggle Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-charcoal/10 hover:bg-charcoal/30 text-bone transition-colors"
        contentEditable={false}
      >
        <div className="flex items-center gap-2.5">
          <BookOpen size={16} className="text-amber" />
          <span className="font-semibold text-sm tracking-wide font-display">Table of Contents</span>
          <span className="text-[10px] bg-charcoal border border-smoke/30 px-2 py-0.5 rounded-full text-steel font-mono">
            {headings.length} headings
          </span>
        </div>
        <div>
          {isOpen ? <ChevronDown size={16} className="text-steel" /> : <ChevronRight size={16} className="text-steel" />}
        </div>
      </div>

      {/* Expanded Table of Contents Outline */}
      {isOpen && (
        <div 
          className="p-4 border-t border-smoke/10 flex flex-col gap-2 bg-[#17171a]/30 max-h-[300px] overflow-y-auto custom-scrollbar"
          contentEditable={false}
        >
          {headings.length === 0 ? (
            <div className="text-xs text-steel py-2 italic text-center">
              No headings found. Add headings (H1, H2, H3) to see them here!
            </div>
          ) : (
            headings.map((heading, idx) => {
              // Set left indent level based on H1, H2, H3
              const indentClass = heading.level === 2 
                ? 'ml-4' 
                : heading.level === 3 
                  ? 'ml-8' 
                  : 'ml-0';
              
              const textClass = heading.level === 1
                ? 'text-bone font-semibold text-xs'
                : heading.level === 2
                  ? 'text-steel font-medium text-[11px]'
                  : 'text-steel/70 text-[10.5px]';

              return (
                <button
                  key={idx}
                  onClick={() => handleHeadingClick(heading.text, heading.level)}
                  className={`text-left hover:text-amber py-1 px-2 rounded hover:bg-charcoal/30 transition-all truncate ${indentClass} ${textClass}`}
                >
                  {heading.text || `Untitled Heading ${heading.level}`}
                </button>
              );
            })
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};
