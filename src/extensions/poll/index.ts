import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PollNodeView } from './PollNodeView';

export interface PollOption {
  id: string;
  text: string;
}

export const PollExtension = Node.create({
  name: 'poll',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      question: {
        default: 'What is your question?',
      },
      align: {
        default: 'center',
      },
      width: {
        default: '100%',
      },
      options: {
        default: [
          { id: '1', text: 'Option 1' },
          { id: '2', text: 'Option 2' },
        ] as PollOption[],
      },
      votes: {
        default: {} as Record<string, number>, // e.g. { '1': 5, '2': 0 }
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="poll"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'poll' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PollNodeView);
  },
});
