import React, { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { CustomCodeBlockExtension } from '../extensions/code-block';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import 'highlight.js/styles/atom-one-dark.css'; // Add the CSS for syntax highlighting

const lowlight = createLowlight(common);
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
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import DOMPurify from 'dompurify';

if (typeof window !== 'undefined') {
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const src = (node as Element).getAttribute('src') || '';
      if (!src.startsWith('https://www.youtube.com/embed/')) {
        node.parentNode?.removeChild(node);
      }
    }
  });
}

import CharacterCount from '@tiptap/extension-character-count';

import { AxiomEditorContext, AxiomFeaturesConfig } from './AxiomEditorContext';
import { CustomImageExtension } from '../extensions/image';
import { CustomYoutubeExtension } from '../extensions/youtube';
import { TweetExtension } from '../extensions/tweet';
import { InstagramExtension } from '../extensions/instagram';
import { StashExtension } from '../extensions/stash';
import { CalloutExtension } from '../extensions/callout';
import { SourceLinkExtension } from '../extensions/source-link';
import { TableOfContentsExtension } from '../extensions/table-of-contents';
import { SearchAndReplace } from '../extensions/search-replace';
import { PollExtension } from '../extensions/poll';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { SlashMenuExtension } from '../extensions/slash-menu';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';

import { ColoredUnderline, ColoredStrike } from '../extensions/format';
import { CustomHorizontalRuleExtension } from '../extensions/horizontal-rule';

interface AxiomEditorProviderProps {
  initialContent: JSONContent | string;
  onChange?: (json: JSONContent, html: string) => void;
  uploadImage?: (file: File) => Promise<string>;
  children: React.ReactNode;
  minHeight?: string | number;
  maxHeight?: string | number;
  height?: string | number;
  features?: AxiomFeaturesConfig;
}

export const AxiomEditorProvider: React.FC<AxiomEditorProviderProps> = ({
  initialContent,
  onChange,
  uploadImage,
  children,
  minHeight,
  maxHeight,
  height,
  features,
}) => {
  const [isSaved, setIsSaved] = useState(true);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'link' | 'video' | 'tweet' | 'instagram'>('link');
  const [mediaModalInput, setMediaModalInput] = useState('');
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [aiCopilotOpen, setAICopilotOpen] = useState(false);
  const [aiSelectedText, setAISelectedText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const extensions = React.useMemo(() => {
    const exts: any[] = [
      StarterKit.configure({ 
        heading: { levels: [1, 2, 3] },
        strike: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      CustomHorizontalRuleExtension,
      ColoredUnderline,
      ColoredStrike,
      CustomTextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image', 'youtube'] }),
      Link.configure({ 
        openOnClick: false, 
        HTMLAttributes: { 
          class: 'text-amber hover:text-amber/80 transition-colors underline underline-offset-4 cursor-pointer',
          rel: 'noopener noreferrer'
        },
        validate: href => /^https?:\/\//.test(href) || /^mailto:/.test(href)
      }),
      CustomImageExtension.configure({ inline: false }),
      CustomCodeBlockExtension.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ];

    if (features?.dragDrop !== false) {
      exts.push(GlobalDragHandle.configure({
        dragHandleWidth: 20,
        scrollTreshold: 100,
        customIcon: `<svg viewBox="0 0 14 24" width="14" height="24" stroke="currentColor" fill="currentColor" stroke-width="0"><path d="M4 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5-10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>`
      }));
    }

    if (features?.slashCommands !== false) exts.push(SlashMenuExtension);
    if (features?.characterCount !== false) exts.push(CharacterCount);
    if (features?.tableOfContents !== false) exts.push(TableOfContentsExtension);
    if (features?.callout !== false) exts.push(CalloutExtension);
    if (features?.stash !== false) exts.push(StashExtension);
    if (features?.findReplace !== false) exts.push(SearchAndReplace);
    const pasteRulesEmbeds = typeof features?.pasteRules === 'object' ? features.pasteRules.embeds !== false : features?.pasteRules !== false;
    const pasteRulesSourceLink = typeof features?.pasteRules === 'object' ? features.pasteRules.sourceLink !== false : features?.pasteRules !== false;

    if (features?.sourceLink !== false) exts.push(SourceLinkExtension.configure({ pasteRules: pasteRulesSourceLink }));
    if (features?.poll !== false) exts.push(PollExtension);

    const embedsEnabled = features?.embeds !== false;
    const embedConfig = typeof features?.embeds === 'object' ? features.embeds : {};
    if (embedsEnabled && embedConfig.youtube !== false) exts.push(CustomYoutubeExtension.configure({ inline: false, pasteRules: pasteRulesEmbeds }));
    if (embedsEnabled && embedConfig.tweet !== false) exts.push(TweetExtension.configure({ pasteRules: pasteRulesEmbeds }));
    if (embedsEnabled && embedConfig.instagram !== false) exts.push(InstagramExtension.configure({ pasteRules: pasteRulesEmbeds }));

    if (features?.collaboration) {
      exts.push(
        Collaboration.configure({
          document: features.collaboration.document,
        }),
        CollaborationCursor.configure({
          provider: features.collaboration.provider,
          user: features.collaboration.user,
        })
      );
    }
    
    return exts;
  }, [features]);

  const editor = useEditor({
    extensions,
    content: features?.collaboration ? undefined : (typeof initialContent === 'string' 
      ? (initialContent ? DOMPurify.sanitize(initialContent, { 
          ADD_TAGS: ['iframe'], 
          ADD_ATTR: ['allowfullscreen', 'frameborder', 'src', 'data-type', 'data-sources', 'data-tweet-id'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
        }) : '<p></p>') 
      : initialContent),
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
        return DOMPurify.sanitize(html, { 
          ADD_TAGS: ['iframe'], 
          ADD_ATTR: ['allowfullscreen', 'frameborder', 'src', 'data-type', 'data-sources', 'data-tweet-id'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
        });
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
          event.preventDefault();
          setFindReplaceOpen(prev => !prev);
          return true;
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

  useEffect(() => {
    const handleImageUpload = async (e: Event) => {
      const customEvent = e as CustomEvent<{ file: File, position?: number }>;
      const { file, position } = customEvent.detail;
      if (!file) return;

      if (uploadImage) {
        setIsSaved(false);
        try {
          const url = await uploadImage(file);
          if (position !== undefined) {
            editor?.chain().insertContentAt(position, { type: 'image', attrs: { src: url } }).focus().run();
          } else {
            editor?.chain().focus().insertContent({ type: 'image', attrs: { src: url } }).run();
          }
        } catch (error) {
          console.error("Image upload failed", error);
        } finally {
          setIsSaved(true);
        }
      } else {
        const url = URL.createObjectURL(file);
        if (position !== undefined) {
          editor?.chain().insertContentAt(position, { type: 'image', attrs: { src: url } }).focus().run();
        } else {
          editor?.chain().focus().insertContent({ type: 'image', attrs: { src: url } }).run();
        }
      }
    };

    window.addEventListener('axiom-image-upload', handleImageUpload);
    return () => window.removeEventListener('axiom-image-upload', handleImageUpload);
  }, [editor, uploadImage]);

  useEffect(() => {
    const handleToggle = () => setFindReplaceOpen(prev => !prev);
    window.addEventListener('axiom-find-replace-toggle', handleToggle);
    return () => window.removeEventListener('axiom-find-replace-toggle', handleToggle);
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setAISelectedText('');
      setAICopilotOpen(prev => !prev);
    };
    window.addEventListener('axiom-ai-copilot-toggle', handleToggle);
    return () => window.removeEventListener('axiom-ai-copilot-toggle', handleToggle);
  }, []);

  return (
    <AxiomEditorContext.Provider value={{
      editor,
      features,
      isSaved, setIsSaved,
      mediaModalOpen, setMediaModalOpen,
      mediaModalType, setMediaModalType,
      mediaModalInput, setMediaModalInput,
      uploadImage,
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
 
 
 