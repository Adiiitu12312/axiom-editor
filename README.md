# AxiomEditor

A premium, modular narrative architecture block editor built on **React**, **Tiptap**, and **Tailwind CSS**.

AxiomEditor is designed for modern developers who need a gorgeous, distraction-free editing interface out of the box, but require the flexibility to tear it down and build custom compositions. By default, it ships with a dark-mode obsidian aesthetic, custom multi-color highlights, drag-and-drop media embeds, and clean AST rendering support.

---

## Key Features

*   ✨ **Monolithic & Modular APIs:** Use the all-in-one `<AxiomEditor />` component for instant setup, or compose custom layouts using `<AxiomEditorProvider />`, `<AxiomToolbar />`, and `<AxiomContent />`.
*   🚀 **Advanced Slash Commands:** Press `/` on a blank line to trigger a fluid slash command dropdown with smooth transitions and keyboard navigation support.
*   🎨 **Full Design Token Control:** Every color, border, and background is mapped to standard CSS custom properties. Customize the editor to light mode, amber mode, or your corporate brand with single CSS overrides.
*   🌈 **Simultaneous Multi-Color Highlighting:** Support for concurrently underlining or striking-through text in multiple custom colors (Bone, Amber, Charcoal, Obsidian, and Accent Primary).
*   🖼️ **Advanced Media System:** Drop-in embeds for **YouTube** videos, **X (Twitter)** posts, **Instagram** reels, and inline image uploads with resizing handles and captions.
*   📊 **Sync & Word Count Indicator:** Minimalist bottom status bar showing word counts and a Pulsing Sync indicator representing save-states.
*   💾 **Serialized JSON AST Parser:** Direct access to Tiptap JSON abstract syntax trees (AST) and a fast renderer component (`<AxiomJSONRenderer />`) to display them on user pages.

---

## Installation

Install the package and its required peer dependencies in your React project:

```bash
npm install axiom-editor lucide-react react react-dom
```

### Import Styles
Make sure to import the editor stylesheet in your main entry file (e.g., `main.tsx` or `_app.tsx`):

```tsx
import 'axiom-editor/style.css';
```

---

## Implementation Guide

### 1. Quick Start (Monolithic Layout)

For standard setups, use the monolithic wrapper which includes a top sticky toolbar, a fixed-height editor canvas, and automated media modal routing.

```tsx
import React, { useState } from 'react';
import { AxiomEditor } from 'axiom-editor';
import type { JSONContent } from '@tiptap/core';
import 'axiom-editor/style.css';

function App() {
  const [content, setContent] = useState<JSONContent | string>('<p>Write your narrative here...</p>');

  return (
    <div className="min-h-screen bg-neutral-900 p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
        <AxiomEditor 
          initialContent={content}
          onChange={(json, html) => {
            console.log('JSON AST:', json);
            console.log('HTML String:', html);
          }}
        />
      </div>
    </div>
  );
}

export default App;
```

---

### 2. Advanced Modular UI Composition

If you want a custom layout—such as placing the toolbar at the bottom, embedding the editor canvas in a floating card, or building custom sidebar controls—you can compose the subcomponents directly.

All child components inside `<AxiomEditorProvider />` share the editor context automatically via the `useAxiomEditor` hook.

```tsx
import React from 'react';
import { 
  AxiomEditorProvider, 
  AxiomToolbar, 
  AxiomContent, 
  MediaMenu, 
  useAxiomEditor 
} from 'axiom-editor';

function CustomSyncIndicator() {
  const { editor } = useAxiomEditor();
  if (!editor) return null;
  
  return (
    <div className="text-xs text-neutral-500 font-mono">
      Words: {editor.storage.characterCount.words()}
    </div>
  );
}

function CustomLayoutEditor() {
  return (
    <AxiomEditorProvider initialContent="Composition is key.">
      <div className="flex flex-col gap-6 p-4 border rounded-3xl bg-black">
        
        {/* Render Canvas First */}
        <div className="p-4 bg-zinc-900/50 rounded-2xl">
          <AxiomContent />
        </div>
        
        {/* Render Toolbar Below the Canvas */}
        <div className="p-2 border-t border-zinc-800 flex items-center justify-between">
          <AxiomToolbar />
          <CustomSyncIndicator />
        </div>
        
        {/* The Media Insertion Modals */}
        <MediaMenu />
      </div>
    </AxiomEditorProvider>
  );
}
```

---

### 3. Native Image Upload Handler

Configure the `uploadImage` hook to handle local file selection and return a secure uploaded image URL. Below is a production-ready example integrating with **Cloudinary**:

```tsx
const handleImageUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_unsigned_preset'); // Replace with your preset
  formData.append('cloud_name', 'your_cloudinary_cloud_name'); // Replace with your cloud name

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/your_cloudinary_cloud_name/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const result = await response.json();
  return result.secure_url; // Returns the public hosting URL for Tiptap
};

// Usage:
// <AxiomEditor uploadImage={handleImageUpload} ... />
```

---

## Custom Theming

AxiomEditor namespaced classes are bound to CSS variables, preventing compilation purges in host projects and ensuring complete customizability. By default, it features a rich dark-mode theme. 

To override colors, target the `.axiom-editor-wrapper` wrapper in your CSS:

```css
/* Custom Light Mode Theme */
.axiom-editor-wrapper {
  --axiom-bg: #ffffff;
  --axiom-bg-card: #f4f4f5;
  --axiom-text: #09090b;
  --axiom-text-muted: #71717a;
  --axiom-border: #e4e4e7;
  --axiom-border-separator: #d4d4d8;
  --axiom-primary: #f59e0b; /* Amber accent highlight */
  --axiom-primary-text: #09090b;
  --axiom-primary-text-muted: #d97706;
  --axiom-button-active: #f3f4f6;
  --axiom-button-active-text: #0f172a;
}
```

### Full Token References

| CSS Variable | Description | Default Dark Theme Value |
| :--- | :--- | :--- |
| `--axiom-bg` | Main editor viewport background | `#0f0f10` (Obsidian black) |
| `--axiom-bg-card` | Menus, popups, and modal background | `#18181b` (Charcoal zinc) |
| `--axiom-text` | Body and header text | `#fafafa` (Bone white) |
| `--axiom-text-muted` | Secondary indicators, placeholders | `#71717a` (Steel gray) |
| `--axiom-border` | Component borders and wrappers | `rgba(250, 250, 250, 0.1)` |
| `--axiom-border-separator` | Internal toolbar separator vertical rules | `rgba(250, 250, 250, 0.06)` |
| `--axiom-primary` | Accent highlight color | `#ffbf00` (Amber gold) |
| `--axiom-primary-text` | Text color on active primary buttons | `#0f0f10` |
| `--axiom-primary-text-muted`| Colored highlights, word count save states | `#ffbf00` |
| `--axiom-button-active` | Active formatting state buttons background | `rgba(250, 250, 250, 0.08)` |
| `--axiom-button-active-text`| Active state icon/font color | `#ffbf00` |

---

## Rendering Content Outside the Editor

When saving content from the editor, you should store the **JSON AST** output. To render this JSON back on your website or article page with correct narrative styling, use `<AxiomJSONRenderer />`:

```tsx
import React from 'react';
import { AxiomJSONRenderer } from 'axiom-editor';

const savedArticleJson = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Stunning Block Architectures" }]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "This content was rendered directly from JSON AST." }]
    }
  ]
};

function ArticlePage() {
  return (
    <article className="max-w-3xl mx-auto p-6 bg-zinc-950 text-white">
      {/* Renders Tiptap nodes natively using React elements */}
      <AxiomJSONRenderer content={savedArticleJson} />
    </article>
  );
}
```

---

## API Reference

### Props: `<AxiomEditor />` & `<AxiomEditorProvider />`

| Prop | Type | Description |
| :--- | :--- | :--- |
| `initialContent` | `string \| JSONContent` | Initial markdown, HTML string, or parsed JSON AST document content. |
| `onChange` | `(json: JSONContent, html: string) => void` | Event fires on text/formatting changes, returning the AST and HTML string. |
| `uploadImage` | `(file: File) => Promise<string>` | Async file uploading function returning a public url path. |
| `minHeightClass` | `string` | Optional CSS height class for canvas height configuration. |
| `maxHeightClass` | `string` | Optional CSS height class for max constraints configuration. |

### Component Exports

*   **`<AxiomEditor />`**: Easy-to-use monolithic component with built-in toolbar, canvas, and insertion routing.
*   **`<AxiomEditorProvider />`**: Context wrapper mapping editor instances. Required for composing custom layouts.
*   **`<AxiomContent />`**: Editor editor content layer with scroll constraints and styling namespaces.
*   **`<AxiomToolbar />`**: Text layout modifiers, formatting utilities, headers, and video hooks.
*   **`<MediaMenu />`**: Absolute-overlay modal triggers handling links, tweets, YouTube, and image attachments.
*   **`<AxiomJSONRenderer />`**: High performance rendering agent mapping saved JSON schemas back to React nodes.
*   **`useAxiomEditor()`**: Custom hook retrieving current `{ editor }` instance variables and status.

---

## License

This project is licensed under the [MIT License](./LICENSE).
