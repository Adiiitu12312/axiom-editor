import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CalloutNodeView } from './CalloutNodeView';

export const CalloutExtension = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,
  
  addAttributes() {
    return {
      emoji: { default: '💡' },
      type: { default: 'info' }
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="callout"]' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
 
 
  