import React, { useState } from 'react';
import { useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';

import { TextStyle } from '@tiptap/extension-text-style';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';

const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});

import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import DOMPurify from 'dompurify';
import { CharacterCount } from '@tiptap/extension-character-count';
import { AxiomEditorContext, AxiomFeaturesConfig } from './AxiomEditorContext';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import { ColoredUnderline, ColoredStrike } from '../extensions/format';
import { CustomHorizontalRuleExtension } from '../extensions/horizontal-rule';

interface CursusEditorProviderProps {
  initialContent: JSONContent | string;
  onChange?: (json: JSONContent, html: string) => void;
  children: React.ReactNode;
  minHeight?: string | number;
  maxHeight?: string | number;
  height?: string | number;
  features?: AxiomFeaturesConfig;
  maxLines?: number;
  maxChars?: number;
  maxCharsPerLine?: number;
}

// 100x SECURE DOMPurify Configuration
const STRICT_PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'blockquote', 'ul', 'ol', 'li', 'strong', 
    'b', 'em', 'i', 's', 'strike', 'del', 'u', 
    'a', 'code', 'pre', 'br', 'hr', 'span', 
    'div' // Needed for GlobalDragHandle and structural wrappers
  ],
  ALLOWED_ATTR: ['href', 'rel', 'target', 'class', 'style', 'data-type', 'data-checked'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

export const CursusEditorProvider: React.FC<CursusEditorProviderProps> = ({
  initialContent,
  onChange,
  children,
  minHeight,
  maxHeight,
  height,
  features,
  maxLines,
  maxChars,
  maxCharsPerLine,
}) => {
  const [isSaved, setIsSaved] = useState(true);

  // We keep these states to maintain context API compatibility, even if unused by Cursus natively
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'link' | 'video' | 'tweet' | 'instagram'>('link');
  const [mediaModalInput, setMediaModalInput] = useState('');
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [aiCopilotOpen, setAICopilotOpen] = useState(false);
  const [aiSelectedText, setAISelectedText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const extensions = React.useMemo(() => {
    const skConfig: any = {
      strike: false, 
      underline: false,
      codeBlock: false,
      horizontalRule: false,
    };

    if (features?.undo === false && features?.redo === false) skConfig.history = false;
    if (features?.heading === false) skConfig.heading = false; else skConfig.heading = { levels: [1, 2, 3] };
    if (features?.bold === false) skConfig.bold = false;
    if (features?.italic === false) skConfig.italic = false;
    if (features?.blockquote === false) skConfig.blockquote = false;
    if (features?.list === false) {
      skConfig.bulletList = false;
      skConfig.orderedList = false;
      skConfig.listItem = false;
    }

    const exts: any[] = [
      StarterKit.configure(skConfig),
      CustomHorizontalRuleExtension,
    ];

    if (features?.link !== false) {
      exts.push(Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer', // Hardened against TabNabbing
        },
      }));
    }

    if (features?.underline !== false) {
      exts.push(ColoredUnderline);
    }
    if (features?.strike !== false) {
      exts.push(ColoredStrike);
    }
    if (features?.textColor !== false) {
      exts.push(CustomTextStyle, Color);
    }

    if (features?.align !== false) {
      exts.push(TextAlign.configure({ types: ['heading', 'paragraph'] }));
    }
    
    if (features?.list !== false) {
      exts.push(TaskList, TaskItem.configure({ nested: true }));
    }

    if (features?.dragDrop !== false) {
      exts.push(GlobalDragHandle.configure({
        dragHandleWidth: 20,
        scrollTreshold: 100,
        customIcon: `<svg viewBox="0 0 14 24" width="14" height="24" stroke="currentColor" fill="currentColor" stroke-width="0"><path d="M4 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5-10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>`
      }));
    }

    if (features?.characterCount !== false) {
      exts.push(CharacterCount.configure({ limit: maxChars || undefined }));
    }

    return exts;
  }, [features, maxChars]);

  const parsedContent = React.useMemo(() => {
    if (typeof initialContent === 'string' && initialContent) {
      try {
        const json = JSON.parse(initialContent);
        if (json && json.type === 'doc') return json;
      } catch {
        // Not JSON, fallback to HTML
      }
      return DOMPurify.sanitize(initialContent, STRICT_PURIFY_CONFIG);
    }
    return initialContent || '<p></p>';
  }, [initialContent]);

  const editor = useEditor({
    extensions,
    content: parsedContent,
    onUpdate: ({ editor }) => {
      setIsSaved(false);
      const json = editor.getJSON();
      const html = editor.getHTML();
      if (onChange) onChange(json, html);
      setTimeout(() => setIsSaved(true), 800);
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-full p-4 sm:p-6 md:p-8 pb-16 md:pb-24 text-bone font-body leading-relaxed prose-p:my-1 prose-headings:my-4`,
      },
      transformPastedHTML: (html) => {
        return DOMPurify.sanitize(html, STRICT_PURIFY_CONFIG);
      },
      handleKeyDown: (view, event) => {
        // Block new lines if we've reached maxLines
        if (event.key === 'Enter' && maxLines) {
          const { state } = view;
          if (state.doc.childCount >= maxLines) {
            event.preventDefault();
            return true;
          }
        }
        
        // Block typing if the current line exceeds maxCharsPerLine
        if (event.key.length === 1 && maxCharsPerLine && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const { state } = view;
          const { $from, empty } = state.selection;
          if (empty && ($from.parent.type.name === 'paragraph' || $from.parent.type.name === 'heading')) {
            if ($from.parent.textContent.length >= maxCharsPerLine) {
              event.preventDefault();
              return true;
            }
          }
        }
        
        if (event.key === 'Backspace') {
          const { state } = view;
          const { selection } = state;
          const { $anchor } = selection;
          
          if ($anchor.parentOffset === 0 && $anchor.parent.type.name === 'paragraph' && $anchor.parent.content.size === 0) {
            const prevNodeIndex = $anchor.index($anchor.depth - 1) - 1;
            if (prevNodeIndex >= 0) {
              const prevNode = $anchor.node($anchor.depth - 1).child(prevNodeIndex);
              if (prevNode.type.name === 'horizontalRule') {
                event.preventDefault();
                const pos = $anchor.before() - 1;
                const tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
                view.dispatch(tr);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  return (
    <AxiomEditorContext.Provider value={{
      editor,
      features,
      isSaved, setIsSaved,
      mediaModalOpen, setMediaModalOpen,
      mediaModalType, setMediaModalType,
      mediaModalInput, setMediaModalInput,
      uploadImage: undefined, // no image uploads
      minHeight,
      maxHeight,
      height,
      findReplaceOpen,
      setFindReplaceOpen,
      aiCopilotOpen,
      setAICopilotOpen,
      aiSelectedText,
      setAISelectedText,
      sidebarOpen,
      setSidebarOpen
    }}>
      {children}
    </AxiomEditorContext.Provider>
  );
};
