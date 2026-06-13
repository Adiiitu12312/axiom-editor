import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CustomHorizontalRule } from './CustomHorizontalRule';

export const CustomHorizontalRuleExtension = HorizontalRule.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CustomHorizontalRule);
  },
});
 