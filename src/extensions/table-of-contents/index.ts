import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TOCNodeView } from './TOCNodeView';

export const TableOfContentsExtension = Node.create({
  name: 'tableOfContents',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  parseHTML() {
    return [
      { tag: 'div[data-type="table-of-contents"]' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'table-of-contents' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TOCNodeView);
  },
});
 