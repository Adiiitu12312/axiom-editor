import { Node, mergeAttributes, nodeInputRule, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SourceLinkNodeView } from './SourceLinkNodeView';

export interface SourceLinkOptions {
  HTMLAttributes: Record<string, any>;
  pasteRules: boolean;
}

export const SourceLinkExtension = Node.create<SourceLinkOptions>({
  name: 'sourceLink',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      pasteRules: true,
    };
  },

  addAttributes() {
    return {
      sources: {
        default: [],
        parseHTML: element => {
          const sourcesStr = element.getAttribute('data-sources');
          try {
            return sourcesStr ? JSON.parse(sourcesStr) : [];
          } catch {
            return [];
          }
        },
        renderHTML: attributes => {
          return {
            'data-sources': JSON.stringify(attributes.sources),
          };
        },
      },
      color: {
        default: '#e4e4e7',
        parseHTML: element => element.getAttribute('data-color') || '#e4e4e7',
        renderHTML: attributes => {
          return {
            'data-color': attributes.color || '#e4e4e7',
          };
        },
      },
      bgColor: {
        default: '#1f1f23cc',
        parseHTML: element => element.getAttribute('data-bg-color') || '#1f1f23cc',
        renderHTML: attributes => {
          return {
            'data-bg-color': attributes.bgColor || '#1f1f23cc',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="source-link"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'source-link' })];
  },

  addInputRules() {
    if (!this.options.pasteRules) return [];
    return [
      nodeInputRule({
        find: /(\/cite-((?:\(['"][^'"]+['"]\s*\|\s*['"][^'"]+['"]\)-?)+))/,
        type: this.type,
        getAttributes: (match) => {
          const content = match[2];
          const sourceRegex = /\(['"]([^'"]+)['"]\s*\|\s*['"]([^'"]+)['"]\)/g;
          const sources = [];
          let m;
          while ((m = sourceRegex.exec(content)) !== null) {
            sources.push({ name: m[1], url: m[2] });
          }
          return { sources };
        },
      }),
    ];
  },

  addPasteRules() {
    if (!this.options.pasteRules) return [];
    return [
      nodePasteRule({
        find: /(\/cite-((?:\(['"][^'"]+['"]\s*\|\s*['"][^'"]+['"]\)-?)+))/g,
        type: this.type,
        getAttributes: (match) => {
          const content = match[2];
          const sourceRegex = /\(['"]([^'"]+)['"]\s*\|\s*['"]([^'"]+)['"]\)/g;
          const sources = [];
          let m;
          while ((m = sourceRegex.exec(content)) !== null) {
            sources.push({ name: m[1], url: m[2] });
          }
          return { sources };
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SourceLinkNodeView);
  },
});
 