import { Underline as BaseUnderline } from '@tiptap/extension-underline';
import { Strike as BaseStrike } from '@tiptap/extension-strike';

export const ColoredUnderline = BaseUnderline.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.textDecorationColor || null,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `text-decoration-color: ${attributes.color};`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      setUnderline: (attributes?: any) => ({ commands }) => {
        return commands.setMark(this.name, attributes);
      },
      toggleUnderline: (attributes?: any) => ({ commands }) => {
        return commands.toggleMark(this.name, attributes);
      },
      unsetUnderline: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

export const ColoredStrike = BaseStrike.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.textDecorationColor || null,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `text-decoration-color: ${attributes.color};`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      setStrike: (attributes?: any) => ({ commands }) => {
        return commands.setMark(this.name, attributes);
      },
      toggleStrike: (attributes?: any) => ({ commands }) => {
        return commands.toggleMark(this.name, attributes);
      },
      unsetStrike: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});
 
 
  