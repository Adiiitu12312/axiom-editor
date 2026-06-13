import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from './ImageNodeView';

export const CustomImageExtension = Node.create({
  name: 'image',
  group: 'block',
  atom: true, // Strict schema: cannot have nested children

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      caption: { default: null },
      captionPosition: { default: 'below' },
      width: { default: '100%' },
      align: { default: 'center' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: dom => {
          if (typeof dom === 'string') return {};
          const src = dom.getAttribute('src') || '';
          if (!/^https?:\/\//i.test(src) && !/^data:image\//i.test(src)) {
            return false;
          }
          return {
            src,
            alt: dom.getAttribute('alt'),
            width: dom.style.width || dom.getAttribute('width') || '100%',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
 
 
  