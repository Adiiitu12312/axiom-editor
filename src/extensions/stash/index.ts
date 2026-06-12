import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { StashNodeView } from './StashNodeView';

export const StashExtension = Node.create({
  name: 'stash',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [
      { tag: 'div[data-type="stash"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'stash' }), 0]; // 0 is the hole for content
  },

  addNodeView() {
    return ReactNodeViewRenderer(StashNodeView);
  },
});
 
 
 