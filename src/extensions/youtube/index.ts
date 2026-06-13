import { Youtube } from '@tiptap/extension-youtube';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { YoutubeNodeView } from './YoutubeNodeView';

export interface CustomYoutubeOptions {
  pasteRules?: boolean;
  inline?: boolean;
  allowFullscreen?: boolean;
  controls?: boolean;
  nocookie?: boolean;
  width?: number | string;
  height?: number | string;
}

export const CustomYoutubeExtension = Youtube.extend<CustomYoutubeOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      pasteRules: true,
    };
  },
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
  addPasteRules() {
    if (!this.options.pasteRules) return [];
    return this.parent?.() || [];
  },
});
 
 
 