import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/core';
import DOMPurify from 'dompurify';
import { StarterKit } from '@tiptap/starter-kit';

import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';

import { ColoredUnderline, ColoredStrike } from './extensions/format';
import { CustomHorizontalRuleExtension } from './extensions/horizontal-rule';

const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
    };
  },
});

export const generateCursusHtml = (json: JSONContent, features?: any): string => {
  const exts: any[] = [
    StarterKit.configure({ 
      // @ts-expect-error: history is supported but sometimes missing from Partial<StarterKitOptions>
      history: false,
      heading: features?.heading !== false ? { levels: [1, 2, 3] } : false,
      bold: features?.bold !== false ? {} : false,
      italic: features?.italic !== false ? {} : false,
      blockquote: features?.blockquote !== false ? {} : false,
      bulletList: features?.list !== false ? {} : false,
      orderedList: features?.list !== false ? {} : false,
      strike: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    CustomHorizontalRuleExtension,
  ];

  if (features?.underline !== false) exts.push(ColoredUnderline);
  if (features?.strike !== false) exts.push(ColoredStrike);
  if (features?.textColor !== false) exts.push(CustomTextStyle, Color);

  if (features?.align !== false) {
    exts.push(TextAlign.configure({ types: ['heading', 'paragraph'] }));
  }
  
  if (features?.list !== false) exts.push(TaskList, TaskItem.configure({ nested: true }));

  const rawHtml = generateHTML(json, exts);

  // Return deeply sanitized HTML natively
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(rawHtml);
  }

  // Fallback for SSR/Node if window is undefined, though DOMPurify normally requires JSDOM on the server.
  // Assuming the developer handles SSR sanitization if running strictly in Node.
  return rawHtml;
};
