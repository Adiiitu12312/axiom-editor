# Cursus Editor

A lightweight, highly customizable, and 100x secure rich-text block editor built on top of [Tiptap](https://tiptap.dev/) and React.

Cursus Editor provides a beautiful, Notion-style editing experience out of the box, with full support for Markdown shortcuts, drag-and-drop blocks, floating bubble menus, and deep customizability. 

## Features

- 🛡️ **100x Secure**: Fortified with strict `DOMPurify` allow-lists. Defends against XSS, TabNabbing, and malicious iframe injections natively.
- 🎨 **Fully Customizable**: Built to be completely restyled. Inject your own CSS variables to instantly theme the editor.
- 🚀 **Markdown Shortcuts**: Type `1.`, `-`, `>` or `#` to instantly create lists, quotes, and headings.
- 🧱 **Block Architecture**: Notion-style drag-and-drop block handles for seamless reordering.
- 💬 **Bubble Menu**: Highlight text to access a beautiful floating formatting menu with custom text highlights.
- 📏 **Input Constraints**: Optionally restrict the maximum number of lines, characters, or characters-per-line.

## Installation

Install via npm:

```bash
npm install cursus-editor
```

Make sure you also install the peer dependencies:

```bash
npm install react react-dom
```

## Quick Start

Import the editor and its core styles into your React application:

```tsx
import { useState } from 'react';
import { CursusEditor } from 'cursus-editor';
import 'cursus-editor/style.css'; // Don't forget the core styles!

function App() {
  const [content, setContent] = useState("<p>Hello World</p>");

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <CursusEditor
        initialContent={content}
        onChange={(json, html) => setContent(html)}
        features={{
          toolbar: false, // Turn off the top static toolbar
          bubbleMenu: true, // Use the floating Notion-style menu
          list: true,
          heading: true
        }}
      />
    </div>
  );
}

export default App;
```

## Customization

Cursus Editor is designed to inherit your application's typography and color scheme automatically. You can easily override its internal CSS variables to match your exact brand.

Wrap the editor in a container (or target `.axiom-editor-wrapper`) and set your custom properties:

```css
.axiom-editor-wrapper {
  /* Core Backgrounds */
  --axiom-bg: #ffffff;
  --axiom-bg-card: #f4f4f5;
  
  /* Typography */
  --axiom-text: #18181b;
  --axiom-text-muted: #a1a1aa;
  
  /* Primary Brand Color (Used for active buttons and highlights) */
  --axiom-primary: #3b82f6; 
  
  /* Borders */
  --axiom-border: #e4e4e7;
  
  /* List Markers (Optional: Inherits text color by default) */
  --axiom-list-marker-color: #3b82f6; 
}
```

## Headless Rendering (Read-Only)

If you are saving the editor's content as a JSON string to your database, you can use the lightweight `CursusJSONRenderer` to display the content beautifully *without* loading the entire editor engine.

This is perfect for blogs, articles, or feed views where the user is just reading.

```tsx
import { CursusJSONRenderer } from 'cursus-editor';
import 'cursus-editor/style.css'; // Requires core styles for typography

function BlogPost({ contentJSON }) {
  // contentJSON is the JSON output saved from CursusEditor's onChange
  
  return (
    <div className="axiom-editor-wrapper">
      <CursusJSONRenderer content={JSON.parse(contentJSON)} />
    </div>
  );
}
```

## Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string \| JSONContent` | `""` | The starting HTML string or Tiptap JSON. |
| `onChange` | `(json, html) => void` | `undefined` | Callback fired when the content changes. |
| `features` | `AxiomFeaturesConfig` | All True | Toggle specific editor features on/off (e.g. `list: false`). |
| `minHeight` | `string \| number` | `undefined` | Set a minimum CSS height for the editor canvas. |
| `maxHeight` | `string \| number` | `undefined` | Set a maximum CSS height (enables scrolling). |
| `height` | `string \| number` | `undefined` | Set a fixed CSS height. |
| `maxLines` | `number` | `undefined` | Prevents creating new blocks once the limit is reached. |
| `maxChars` | `number` | `undefined` | Hard limit on the total character count. |
| `maxCharsPerLine` | `number` | `undefined` | Prevents typing if the current block exceeds this length. |

## License

MIT License. See `LICENSE` for more information.