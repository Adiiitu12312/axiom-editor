import type { Editor, Range } from '@tiptap/core';
import { Heading1, Heading2, Heading3, List, ListOrdered, Quote, Archive, MessageSquareWarning, Code, CheckSquare } from 'lucide-react';
import React from 'react';

export interface CommandItemProps {
  title: string;
  description: string;
  icon: React.FC<any>;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const getSuggestionItems = ({ query }: { query: string }): CommandItemProps[] => {
  const items: CommandItemProps[] = [
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: Heading1,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: Heading2,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: Heading3,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: List,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: ListOrdered,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: Quote,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: 'Task List',
      description: 'Track tasks with a to-do list.',
      icon: CheckSquare,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet.',
      icon: Code,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
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
  ];

  return items.filter(item => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
};
