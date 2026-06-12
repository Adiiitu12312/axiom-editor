import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InstagramNodeView } from './InstagramNodeView';

export const InstagramExtension = Node.create({
  name: 'instagram',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      align: { default: 'center' },
      width: { default: '100%' },
      caption: { default: '' },
      captionPosition: { default: 'below' },
      alt: { default: '' },
    };
  },

  parseHTML() {
    return [
      { 
        tag: 'div[data-type="instagram"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          const url = element.getAttribute('data-url') || '';
          if (url && !/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) {
            return false;
          }
          return null;
        }
      },
      { tag: 'blockquote.instagram-media' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const safeUrl = HTMLAttributes.url || '';
    if (safeUrl && !/^https?:\/\/(www\.)?instagram\.com\//i.test(safeUrl)) {
      return ['div'];
    }
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'instagram', 'data-url': safeUrl })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InstagramNodeView);
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)(?:\S*)?/gi,
        type: this.type,
        getAttributes: (match) => {
          return {
            url: match[0],
          };
        },
      }),
    ];
  },
});

 
 
 