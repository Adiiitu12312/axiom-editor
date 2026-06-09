import React, { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';

import 'highlight.js/styles/atom-one-dark.css'; // Add the CSS for syntax highlighting

const lowlight = createLowlight(common);
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

import { AxiomEditorContext } from './AxiomEditorContext';
import { CustomImageExtension } from '../extensions/image';
import { CustomYoutubeExtension } from '../extensions/youtube';
import { TweetExtension } from '../extensions/tweet';
import { InstagramExtension } from '../extensions/instagram';
import { StashExtension } from '../extensions/stash';
import { CalloutExtension } from '../extensions/callout';
import { SlashMenuExtension } from '../extensions/slash-menu';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';

import { ColoredUnderline, ColoredStrike } from '../extensions/format';

interface AxiomEditorProviderProps {
  initialContent: JSONContent | string;
  onChange?: (json: JSONContent, html: string) => void;
  uploadImage?: (file: File) => Promise<string>;
  children: React.ReactNode;
  minHeight?: string | number;
  maxHeight?: string | number;
  height?: string | number;
}

export const AxiomEditorProvider: React.FC<AxiomEditorProviderProps> = ({
  initialContent,
  onChange,
  uploadImage,
  children,
  minHeight,
  maxHeight,
  height,
}) => {
  const [isSaved, setIsSaved] = useState(true);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'link' | 'video' | 'tweet' | 'instagram'>('link');
  const [mediaModalInput, setMediaModalInput] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        heading: { levels: [1, 2, 3] },
        strike: false,
        codeBlock: false,
      }),
      ColoredUnderline,
      ColoredStrike,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image', 'youtube'] }),
      Link.configure({ 
        openOnClick: false, 
        HTMLAttributes: { class: 'text-amber hover:text-amber/80 transition-colors underline underline-offset-4 cursor-pointer' } 
      }),
      CustomImageExtension.configure({ inline: false }),
      CustomYoutubeExtension.configure({ inline: false }),
      TweetExtension,
      InstagramExtension,
      StashExtension,
      CalloutExtension,
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
      SlashMenuExtension,
      GlobalDragHandle.configure({
        dragHandleWidth: 20,
        scrollTreshold: 100,
      }),
    ],
    content: typeof initialContent === 'string' 
      ? (initialContent ? DOMPurify.sanitize(initialContent, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allowfullscreen', 'frameborder', 'src'] }) : '<p></p>') 
      : initialContent,
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

  return (
    <AxiomEditorContext.Provider value={{
      editor,
      isSaved, setIsSaved,
      mediaModalOpen, setMediaModalOpen,
      mediaModalType, setMediaModalType,
      mediaModalInput, setMediaModalInput,
      uploadImage,
      minHeight,
      maxHeight,
      height
    }}>
      {children}
    </AxiomEditorContext.Provider>
  );
};
