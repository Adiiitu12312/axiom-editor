# Axiom Editor 🌌

A premium, highly modular narrative architecture block editor built on top of React, Tiptap, and Tailwind CSS. Designed to provide a cinematic, block-based writing experience with deep customization, AI integration, and native rich-media embedding.

---

## 🚀 Installation & Quick Start

Axiom Editor requires `react` and `react-dom` as peer dependencies.

### 1. Install the Package
```bash
npm install axiom-editor @tiptap/core @tiptap/react
```

### 2. Import CSS and Component
In your main application file (e.g., `App.tsx` or `main.tsx`), import the required CSS.

```tsx
import { AxiomEditor } from 'axiom-editor';
import 'axiom-editor/style.css'; // Important for default block styling!

function App() {
  return (
    <div className="editor-container">
      <AxiomEditor initialContent="<h1>Welcome to Axiom</h1><p>Start typing...</p>" />
    </div>
  );
}
```

---

## 🎨 Design Aesthetics & UI Customization

Axiom Editor does **not** force a rigid UI on you. It relies entirely on **CSS Variables** so you can perfectly integrate it into your own application's theme—whether that's a sleek dark mode, a glassmorphic aesthetic, or a bright minimal design.

### Theming via CSS Variables
To customize the UI (the Toolbar, Slash Menu, AI Copilot, Bubble Menu, etc.), simply define these variables in your global CSS where the editor is mounted. 

```css
:root {
  /* Core Backgrounds */
  --axiom-bg: rgba(20, 20, 20, 0.8);
  --axiom-bg-hover: rgba(255, 255, 255, 0.1);
  
  /* Text Colors */
  --axiom-text: #ffffff;
  --axiom-text-muted: #a0a0a0;
  
  /* Borders and Highlights */
  --axiom-border: rgba(255, 255, 255, 0.15);
  --axiom-primary: #3b82f6; /* Used for active states, highlights, and buttons */
}
```
*Because the editor uses CSS variables, all popups (Slash menus, Poll config, Media config) will instantly adapt to your application's colors, preserving a unified brand aesthetic!*

---

## ⚙️ Ultimate Modularity (Feature Flags)

Axiom is built for extreme versatility. You can strip it down to a barebones plain-text `<textarea>` or enable full Notion-style capabilities by configuring the `features` prop.

```tsx
<AxiomEditor
  initialContent="<p>Start writing...</p>"
  features={{
    // UI Elements
    toolbar: true,           // Shows the fixed formatting toolbar at the top
    bubbleMenu: true,        // Shows the floating text selection menu (Bold, Italic, Ask AI)
    slashCommands: true,     // Enables the '/' popup menu for block insertion
    
    // Extensions
    findReplace: true,       // CTRL+F / CMD+F to search and replace text
    callout: true,           // Enables /callout block
    poll: true,              // Enables /poll interactive blocks
    
    // Media & Embeds
    embeds: {
      youtube: true,
      tweet: true,
      instagram: true,
    },
    
    // Granular Paste Behaviors
    pasteRules: {
      embeds: true,          // Auto-expands pasted Youtube/Twitter URLs into rich blocks
      sourceLink: true,      // Auto-formats text matching /cite-("Name"|"url")
    }
  }}
/>
```

### 🧩 The `pasteRules` Configuration
Axiom's paste rules are highly granular:
- **`pasteRules.embeds`**: If you want users to be able to paste YouTube links as plain text without them turning into giant videos, set this to `false`.
- **`pasteRules.sourceLink`**: If you want to keep the custom `Source Pill` auto-formatting active, set this to `true`.

---

## 🤖 Features & How They Operate

### 1. AI Copilot (`AxiomAICopilot.tsx`)
- Highlighting text and selecting **"Ask AI"** from the floating Bubble Menu brings up the Copilot Sidebar.
- Built to handle prompts like "Summarize this", "Improve phrasing", or "Fix grammar".
- **How it works:** It intercepts the Tiptap editor state, reads the highlighted text selection, and replaces it with AI-generated responses (you will need to hook up your own backend API to the Copilot component).

### 2. Slash Menu (`/`)
- Typing `/` anywhere on a blank line triggers a floating Command List.
- **Customization:** You can disable this entirely via `features.slashCommands = false`. It intelligently tracks your cursor position on the screen to prevent the menu from overflowing out of view.

### 3. Interactive Media Blocks
- Supports Tweets, YouTube, Instagram, and native Images natively without iframes slowing down initial load.
- Clicking on an active media block (or a Poll) opens a dedicated floating **Media Menu** allowing users to align the block (Left, Center, Right) or resize it (25%, 50%, 100%).

### 4. Source Pills (`/cite`)
- A custom Markdown-style syntax parser. 
- Typing `/cite-("Google"|"google.com")` instantly replaces the text with a gorgeous, un-editable interactive UI pill.

---

## 🏗️ Architecture Under the Hood

For advanced developers wanting to fork or contribute:
- **Tiptap Core**: Axiom leverages Tiptap's headless architecture. We define custom `Node` and `Mark` extensions in the `/src/extensions/` directory.
- **React NodeViews**: Complex blocks like Polls, Tweets, and Callouts are rendered using Tiptap's `ReactNodeViewRenderer`. This allows us to put fully functional, interactive React components inside the rich-text editor!
- **State Management**: The editor uses a unified `AxiomEditorContext` to distribute feature flags, AI handlers, and the active `Editor` instance to the Toolbar, Bubble Menu, and all nested extensions.