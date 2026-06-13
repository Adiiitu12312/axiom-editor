import { Extension } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import type { Instance as TippyInstance } from 'tippy.js';
import { CommandList } from './CommandList';
import { getSuggestionItems } from './commands';

export const SlashMenuExtension = Extension.create({
  name: 'slashMenu',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
      features: undefined as any,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => getSuggestionItems({ query, features: this.options.features }),
        render: () => {
          let component: ReactRenderer<any>;
          let popup: TippyInstance[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return component.ref?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
 
 
  