/* eslint-disable @typescript-eslint/no-this-alias */
import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin, PluginKey } from 'prosemirror-state';

export interface SearchAndReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  results: { from: number; to: number }[];
  currentIndex: number;
}

export const SearchAndReplace = Extension.create<any, SearchAndReplaceStorage>({
  name: 'searchAndReplace',

  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      results: [],
      currentIndex: 0,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    const searchKey = new PluginKey('searchAndReplace');

    return [
      new Plugin({
        key: searchKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr) {
            const searchTerm = extension.storage.searchTerm;
            if (!searchTerm) {
              extension.storage.results = [];
              return DecorationSet.empty;
            }

            const doc = tr.doc;
            const decorations: Decoration[] = [];
            const results: { from: number; to: number }[] = [];

            doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text || '';
                let index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
                while (index !== -1) {
                  const from = pos + index;
                  const to = from + searchTerm.length;
                  results.push({ from, to });
                  index = text.toLowerCase().indexOf(searchTerm.toLowerCase(), index + 1);
                }
              }
            });

            extension.storage.results = results;

            results.forEach((match, index) => {
              const isActive = index === extension.storage.currentIndex;
              decorations.push(
                Decoration.inline(match.from, match.to, {
                  class: `axiom-search-match ${isActive ? 'axiom-search-match-active' : ''}`,
                })
              );
            });

            return DecorationSet.create(doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
