<div align="center">
  <h1>🌌 Axiom Editor</h1>
  <p><strong>A premium, highly modular narrative architecture block editor built on React, Tiptap, and Tailwind CSS.</strong></p>
  
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

Axiom is built for extreme versatility. You can strip it down to a barebones `<textarea>` or enable full Notion-style capabilities by passing a `features` configuration object.

```tsx
<AxiomEditor
  initialContent="<p>Start writing...</p>"
  features={{
    // -----------------------------------------
    // Core UI Elements
    // -----------------------------------------
    toolbar: true,           // Fixed formatting toolbar at the top of the editor
    bubbleMenu: true,        // Floating text-selection menu (Bold, Italic, Ask AI)
    slashCommands: true,     // Floating '/' popup menu for block insertion
    
    // -----------------------------------------
    // Advanced Extensions
    // -----------------------------------------
    findReplace: true,       // CTRL+F / CMD+F floating search and replace menu
    callout: true,           // Enables /callout block for highlighted text
    poll: true,              // Enables /poll interactive voting blocks
    stash: true,             // Enables /stash drawer block
    tableOfContents: true,   // Auto-generates a TOC based on heading tags
    
    // -----------------------------------------
    // Media & Embeds
    // -----------------------------------------
    embeds: {
      youtube: true,
      tweet: true,
      instagram: true,
    },
    
    // -----------------------------------------
    // Granular Paste Behaviors
    // -----------------------------------------
    pasteRules: {
      embeds: true,          // If true, pasting a Youtube/X URL auto-expands into a rich block. If false, pastes as plain text link.
      sourceLink: true,      // If true, pasting matching syntax converts to a custom Source Pill UI.
    }
  }}
/>
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

## 🛡️ Security & XSS Sanitization

Axiom Editor prioritizes security when handling rich text and pasted HTML. Under the hood, it uses **DOMPurify** to ruthlessly sanitize all incoming payloads before they hit the DOM.

- **Strict Tag Filtering**: Only explicitly whitelisted tags are allowed. Potentially dangerous tags (`<script>`, `<object>`, `<embed>`) are stripped immediately.
- **Iframe Validation**: `<iframe>` tags are permitted (to support YouTube embeds), but we strictly validate the `src` attribute. If a user pastes an iframe that doesn't start with `https://www.youtube.com/embed/`, the element is immediately deleted from the DOM.
- **Attribute Stripping**: All inline event handlers (`onclick`, `onerror`, `onload`, `onmouseover`) are explicitly forbidden and stripped from pasted HTML to prevent Cross-Site Scripting (XSS) attacks.

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