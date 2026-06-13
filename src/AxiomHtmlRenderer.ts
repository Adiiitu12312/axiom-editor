import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import python from 'highlight.js/lib/languages/python';
import jsonLang from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import java from 'highlight.js/lib/languages/java';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';

import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';

import { CustomCodeBlockExtension } from './extensions/code-block';
import { CustomImageExtension } from './extensions/image';
import { CustomYoutubeExtension } from './extensions/youtube';
import { TweetExtension } from './extensions/tweet';
import { InstagramExtension } from './extensions/instagram';
import { StashExtension } from './extensions/stash';
import { CalloutExtension } from './extensions/callout';
import { SourceLinkExtension } from './extensions/source-link';
import { TableOfContentsExtension } from './extensions/table-of-contents';
import { PollExtension } from './extensions/poll';
import { ColoredUnderline, ColoredStrike } from './extensions/format';
import { CustomHorizontalRuleExtension } from './extensions/horizontal-rule';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('html', xml);
lowlight.register('css', css);
lowlight.register('python', python);
lowlight.register('json', jsonLang);
lowlight.register('bash', bash);
lowlight.register('sql', sql);
lowlight.register('rust', rust);
lowlight.register('go', go);
lowlight.register('cpp', cpp);
lowlight.register('csharp', csharp);
lowlight.register('java', java);
lowlight.register('markdown', markdown);
lowlight.register('yaml', yaml);

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

export const generateAxiomHtml = (json: JSONContent, features?: any): string => {
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
    exts.push(TextAlign.configure({ types: ['heading', 'paragraph', 'image', 'youtube'] }));
  }
  if (features?.link !== false) {
    exts.push(Link.configure({ 
      openOnClick: false, 
      HTMLAttributes: { 
        class: 'text-amber hover:text-amber/80 transition-colors underline underline-offset-4 cursor-pointer',
        rel: 'noopener noreferrer'
      }
    }));
  }
  
  if (features?.image !== false) exts.push(CustomImageExtension.configure({ inline: false }));
  if (features?.codeBlock !== false) exts.push(CustomCodeBlockExtension.configure({ lowlight }));
  if (features?.list !== false) exts.push(TaskList, TaskItem.configure({ nested: true }));
  if (features?.tableOfContents !== false) exts.push(TableOfContentsExtension);
  if (features?.callout !== false) exts.push(CalloutExtension);
  if (features?.stash !== false) exts.push(StashExtension);
  if (features?.sourceLink !== false) exts.push(SourceLinkExtension.configure({ pasteRules: false }));
  if (features?.poll !== false) exts.push(PollExtension);

  const embedsEnabled = features?.embeds !== false;
  const embedConfig = typeof features?.embeds === 'object' ? features.embeds : {};
  if (embedsEnabled && embedConfig.youtube !== false) exts.push(CustomYoutubeExtension.configure({ inline: false, pasteRules: false }));
  if (embedsEnabled && embedConfig.tweet !== false) exts.push(TweetExtension.configure({ pasteRules: false }));
  if (embedsEnabled && embedConfig.instagram !== false) exts.push(InstagramExtension.configure({ pasteRules: false }));

  return generateHTML(json, exts);
};
