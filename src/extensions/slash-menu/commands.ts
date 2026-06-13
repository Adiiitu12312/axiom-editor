import type { Editor, Range } from '@tiptap/core';
import { Heading1, Heading2, Heading3, List, ListOrdered, Quote, Archive, MessageSquareWarning, Code, CheckSquare, Link, BookOpen, Search, Sparkles, BarChart3 } from 'lucide-react';
import React from 'react';

export interface CommandItemProps {
  title: string;
  description: string;
  icon: React.FC<any>;
  command: (props: { editor: Editor; range: Range }) => void;
  id: string; // Add ID to filter easily
}

export const getSuggestionItems = ({ query, features }: { query: string; features?: any }): CommandItemProps[] => {
  const items: CommandItemProps[] = [
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: Heading1,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: Heading2,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: Heading3,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      id: 'bulletList',
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: List,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      id: 'orderedList',
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: ListOrdered,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      id: 'blockquote',
      title: 'Quote',
      description: 'Capture a quote.',
      icon: Quote,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      id: 'taskList',
      title: 'Task List',
      description: 'Track tasks with a to-do list.',
      icon: CheckSquare,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      id: 'codeBlock',
      title: 'Code Block',
      description: 'Capture a code snippet.',
      icon: Code,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      id: 'callout',
      title: 'Callout',
      description: 'Highlight important information.',
      icon: MessageSquareWarning,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'callout',
          content: [{ type: 'paragraph' }]
        }).run();
      },
    },
    {
      id: 'stash',
      title: 'Stash Note',
      description: 'Hidden journalist draft note.',
      icon: Archive,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'stash',
          content: [{ type: 'paragraph' }]
        }).run();
      },
    },
    {
      id: 'sourceLink',
      title: 'Source Link',
      description: 'Add citation links/sources.',
      icon: Link,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'sourceLink',
          attrs: {
            sources: []
          }
        }).run();
      },
    },
    {
      id: 'tableOfContents',
      title: 'Table of Contents',
      description: 'Insert document table of contents outline.',
      icon: BookOpen,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'tableOfContents'
        }).run();
      },
    },
    {
      id: 'findReplace',
      title: 'Find & Replace',
      description: 'Search and replace document text.',
      icon: Search,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        window.dispatchEvent(new CustomEvent('axiom-find-replace-toggle'));
      },
    },
    {
      id: 'aiCopilot',
      title: 'Ask AI',
      description: 'Ask AI to write, edit, or summarize.',
      icon: Sparkles,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        window.dispatchEvent(new CustomEvent('axiom-ai-copilot-toggle'));
      },
    },
    {
      id: 'poll',
      title: 'Poll',
      description: 'Insert an interactive poll.',
      icon: BarChart3,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'poll'
        }).run();
      },
    },
  ];

  const filteredItems = items.filter(item => {
    if (!features) return true;
    if (item.id === 'h1' || item.id === 'h2' || item.id === 'h3') return features.heading !== false;
    if (item.id === 'bulletList' || item.id === 'orderedList' || item.id === 'taskList') return features.list !== false;
    if (item.id === 'blockquote') return features.blockquote !== false;
    if (item.id === 'codeBlock') return features.codeBlock !== false;
    if (item.id === 'callout') return features.callout !== false;
    if (item.id === 'stash') return features.stash !== false;
    if (item.id === 'sourceLink') return features.sourceLink !== false;
    if (item.id === 'tableOfContents') return features.tableOfContents !== false;
    if (item.id === 'findReplace') return features.findReplace !== false;
    if (item.id === 'aiCopilot') return features.aiCopilot !== false;
    if (item.id === 'poll') return features.poll !== false;
    return true;
  });

  return filteredItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
};
 
 
  