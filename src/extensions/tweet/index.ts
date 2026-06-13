import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TweetNodeView } from './TweetNodeView';

export interface TweetOptions {
  pasteRules: boolean;
}

export const TweetExtension = Node.create<TweetOptions>({
  name: 'tweet',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      pasteRules: true,
    };
  },

  addAttributes() {
    return {
      tweetId: { default: null },
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
        tag: 'div[data-type="tweet"]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          const url = element.getAttribute('data-url') || '';
          if (url && !/^https?:\/\/(www\.)?(twitter|x)\.com\//i.test(url)) {
            return false;
          }
          return null;
        }
      },
      { tag: 'blockquote.twitter-tweet' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const safeUrl = HTMLAttributes.url || '';
    if (safeUrl && !/^https?:\/\/(www\.)?(twitter|x)\.com\//i.test(safeUrl)) {
      return ['div']; // Render empty safe block
    }
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'tweet', 'data-url': safeUrl })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TweetNodeView);
  },

  addPasteRules() {
    if (!this.options.pasteRules) return [];
    return [
      nodePasteRule({
        find: /https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/([0-9]+)(?:\?\S*)?/gi,
        type: this.type,
        getAttributes: (match) => {
          return {
            tweetId: match[1],
            url: match[0],
          };
        },
      }),
    ];
  },
});

 
 
 