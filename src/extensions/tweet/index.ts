import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TweetNodeView } from './TweetNodeView';

export const TweetExtension = Node.create({
  name: 'tweet',
  group: 'block',
  atom: true,

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
});
