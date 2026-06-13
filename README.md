<div align="center">
  <h1>🪐 Axiom Editor (v3.0)</h1>
  <p><strong>A premium, enterprise-ready block editor built on Tiptap & React.</strong></p>
  
  [![NPM Version](https://img.shields.io/npm/v/axiom-editor.svg?style=flat-square)](https://www.npmjs.com/package/axiom-editor)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Build Status](https://img.shields.io/github/actions/workflow/status/Adiiitu12312/axiom-editor/ci.yml?style=flat-square)](https://github.com/Adiiitu12312/axiom-editor/actions)
</div>

<br />

Axiom Editor is not just a rich-text editor—it is a full-featured narrative block environment designed to feel cinematic and responsive. It features a native **AI Copilot**, dynamic **Slash Commands**, fully interactive **Media Embeds**, and deep customization options allowing you to tailor the editor perfectly to your app's aesthetics.

---

## 🚀 Installation & Quick Start

Axiom Editor relies on a headless core (Tiptap) and React for its UI components.

### 1. Install the Package
```bash
npm install axiom-editor @tiptap/core @tiptap/react
```

### 2. Basic Setup
To get started, simply mount the `AxiomEditor` component and import its CSS bundle.

```tsx
import React from 'react';
import { AxiomEditor } from 'axiom-editor';

// IMPORTANT: You must import the default CSS for blocks to render correctly!
import 'axiom-editor/style.css'; 

function App() {
  return (
    <div className="editor-container">
      <AxiomEditor 
        initialContent="<h1>Welcome to Axiom</h1><p>Start typing...</p>" 
        onChange={(json, html) => console.log('Editor updated:', html)}
      />
    </div>
  );
}

export default App;
```

---

## ⚙️ Ultimate Modularity (Feature Flags)

### 1. The Editor component
The `AxiomEditor` is the core text area. It accepts standard Tiptap `initialContent` (HTML string or JSON) and calls `onChange` whenever the content is modified.

### 2. Feature Configuration (In-Depth Disabling)
Axiom allows you to completely enable or disable individual blocks, plugins, and UI components. When a feature (like `codeBlock` or `image`) is disabled, **the underlying extension is completely unloaded**, preventing any bypasses via Markdown shortcuts or pasted HTML. 

```tsx
const features = {
  // Core Text Blocks (Level 10 Security: fully unloads extension if false)
  image: true,         // Allows image uploads & drops
  codeBlock: true,     // Allows ``` syntax and code blocks
  heading: true,       // Allows h1, h2, h3
  blockquote: true,    // Allows blockquotes
  link: true,          // Allows hyperlink parsing
  list: true,          // Handles bullet, ordered, and task lists
  align: true,         // Allows text alignment
  bold: true,          
  italic: true,        
  underline: true,
  strike: true,
  textColor: true,
  undo: true,
  redo: true,

  // UI Components
  toolbar: {
    // Pass an array to strictly define which buttons appear in the toolbar
    items: ['bold', 'italic', 'h1', 'h2', 'codeBlock', 'image', 'video']
  },
  bubbleMenu: true,        // Floating text-selection menu
  slashCommands: true,     // Floating '/' popup menu for block insertion

  // Premium Blocks
  aiCopilot: { provider: customAIProvider }, // Set to false to disable
  callout: true,           // Warning/Info Callout blocks
  poll: true,              // Interactive poll blocks
  tableOfContents: true,   // Dynamic TOC sidebar
  
  // Third-Party Embeds
  embeds: {
    youtube: true,
    tweet: true,
    instagram: true
  }
};
```

---

## 🎨 Design Aesthetics & UI Customization

Axiom Editor does **not** force a rigid UI on you. It relies entirely on **CSS Variables**, allowing you to seamlessly integrate it into your application's unique theme (dark mode, light mode, glassmorphic, etc.).

### Theming via CSS Variables
To completely customize the UI (the Toolbar, Slash Menu, AI Copilot, Bubble Menu, etc.), define these variables in the global CSS file where the editor is mounted:

```css
:root {
  /* Core Editor Canvas & Popups */
  --axiom-bg: rgba(20, 20, 20, 0.95);
  --axiom-bg-hover: rgba(255, 255, 255, 0.08);
  
  /* Text Colors */
  --axiom-text: #ffffff;
  --axiom-text-muted: #a0a0a0;
  
  /* Borders and Dividers */
  --axiom-border: rgba(255, 255, 255, 0.12);
  
  /* Brand/Primary Highlight (Used for active states and buttons) */
  --axiom-primary: #3b82f6; 
}
```
*Note: Because the editor uses CSS variables at its core, all deeply nested popups (Slash menus, Poll config, Media config) will instantly adapt to your colors without complex overrides!*

---

## 🤖 Feature Operations & Guide

### 1. AI Copilot (`AxiomAICopilot.tsx`)
- **Activation:** Highlight any text and select the **"✨ Ask AI"** button from the floating Bubble Menu to open the Copilot Sidebar.
- **Capabilities:** Built to handle smart prompts like "Summarize this block", "Improve phrasing", or "Fix grammar".
- **Architecture:** The Sidebar intercepts the Tiptap editor state, reads the exact highlighted selection, and replaces it with AI-generated responses. *(Note: You must hook up your own backend API handler to execute the LLM inference).*

### 2. Slash Menu (`/`)
- **Activation:** Typing `/` anywhere on a blank line triggers a dynamic, floating Command List.
- **Customization:** It intelligently tracks the cursor position to prevent overflowing out of the viewport. Can be completely disabled via `features.slashCommands = false`.

### 3. Interactive Media Blocks
- **Supported Platforms:** Tweets, YouTube, Instagram, and native Images.
- **Media Controls:** Clicking on any active media block or Poll opens a dedicated floating **Media Menu**, allowing users to align the block (Left, Center, Right) or resize it (25%, 50%, 100%) dynamically.

### 4. Source Pills (`/cite`)
- **Activation:** A custom Markdown-style syntax parser. 
- **Usage:** Typing `/cite-("Google"|"https://google.com")` instantly replaces the text with a gorgeous, un-editable interactive UI pill, excellent for footnotes and academic citations.

---

## 📄 Rendering Content

Axiom Editor passes its output in two formats via the `onChange` callback: `json` (Tiptap JSON) and `html` (Raw HTML string). Depending on your use case, Axiom provides three distinct ways to render this content on your frontend:

### 1. The Premium JSON Renderer (`AxiomJSONRenderer`) **[Recommended]**
This is the most powerful and secure way to render content. It takes the raw `JSONContent` from the editor and uses our custom React engine to reconstruct complex interactive blocks like Tweets, Instagram Posts, YouTube Videos, Polls, Callouts, and Table of Contents without relying on dangerously setting inner HTML.
Importantly, it also completely strips hidden **"Stash"** blocks, ensuring internal notes never reach the reader's screen.

```tsx
import { AxiomJSONRenderer } from 'axiom-editor';

// Inside your display component
<AxiomJSONRenderer content={savedJsonContent} />
```

### 2. Standard HTML Rendering (`generateAxiomHtml`)
If you want a lightweight solution without dynamic React components (Polls, TOC, etc.), you can generate clean, sanitized HTML from the editor's JSON output using our built-in `generateAxiomHtml` utility. This utility leverages `@tiptap/html` and accurately renders your custom features under the hood. You should still pass the result through DOMPurify for maximum security.

```tsx
import DOMPurify from 'dompurify';
import { generateAxiomHtml } from 'axiom-editor';

// Use the exported utility to convert JSON -> HTML server-side or client-side
const rawHtml = generateAxiomHtml(savedJsonContent, featuresConfig);
const displayHtml = DOMPurify.sanitize(rawHtml);

// Inside your display component
<div 
  className="axiom-editor-canvas prose prose-invert max-w-none text-bone"
  dangerouslySetInnerHTML={{ __html: displayHtml }} 
/>
```

### 3. Raw JSON Data Handling
If you are building native iOS/Android apps or a completely custom frontend, you can simply store the raw JSON and parse it manually on your client.

```tsx
<AxiomEditor 
  initialContent={""} 
  onChange={(json) => {
    // Save `json` directly to your database
    fetch('/api/save', { method: 'POST', body: JSON.stringify(json) })
  }}
/>
```

---

## 🛡️ Level 10 Security
Axiom implements military-grade security for user-generated content:
- **Zero-Bypass Disabling:** If a core feature (like `image` or `codeBlock`) is disabled in the config, the extension is stripped from the engine at runtime. Users cannot bypass this via pasted HTML, drag-and-drop, or Markdown shortcuts.
- **Deep DOMPurify Sanitization:** All initial HTML strings and dynamically pasted HTML are piped through `dompurify` before ever touching the DOM.
- **Iframe Strictness:** Only `youtube.com/embed/` URLs are allowed in iframes. `onerror`, `onload`, and `onclick` attributes are aggressively stripped to prevent XSS.

---

## 🏗️ Architecture Under the Hood

For advanced developers wanting to fork, extend, or contribute:
- **Tiptap Core**: Axiom leverages Tiptap's headless architecture. We define custom `Node` and `Mark` extensions in the `/src/extensions/` directory.
- **React NodeViews**: Complex blocks like Polls, Tweets, and Callouts are rendered using Tiptap's `ReactNodeViewRenderer`. This bridges the gap between Tiptap's ProseMirror state and React, allowing us to put fully functional, interactive React components inside the rich-text editor canvas!
- **Unified State Management**: The editor uses a unified `AxiomEditorContext` to distribute feature flags, AI handlers, modal states, and the active `Editor` instance down to the Toolbar, Bubble Menu, and all nested extensions.

---
*Built with ❤️ for modern narrative experiences.*

<br />

**Tags:** `react-editor` `tiptap-extensions` `notion-style-editor` `block-editor` `wysiwyg` `ai-copilot` `rich-text-editor` `markdown-editor` `tailwind-editor`