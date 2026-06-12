import { Youtube } from '@tiptap/extension-youtube';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { YoutubeNodeView } from './YoutubeNodeView';

export const CustomYoutubeExtension = Youtube.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: { default: 'center' },
      width: { default: '100%' },
      caption: { default: '' },
      captionPosition: { default: 'below' },
      alt: { default: '' },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(YoutubeNodeView);
  },
});
 
 
 