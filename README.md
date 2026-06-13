# Axiom Editor 🌌

A premium, highly modular narrative architecture block editor built on top of React, Tiptap, and Tailwind CSS. Designed to provide a cinematic, block-based writing experience with deep customization, AI integration, and native rich-media embedding.

---

## 🎨 Design Aesthetics & Customization

Axiom Editor doesn't force a rigid UI on you. It relies on **CSS Variables** allowing you to seamlessly integrate it into any dark-mode, glassmorphic, or premium application design.

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
  --axiom-primary: #3b82f6; /* Used for active states and highlights */
}
```
*Note: Because the editor uses CSS variables, all popups (Slash menus, Poll config, Media config) will instantly adapt to your application's colors, preserving a unified brand aesthetic!*

---

## ⚙️ Ultimate Modularity (Feature Flags)

Axiom is built for extreme versatility. You can strip it down to a barebones `<textarea>` or enable full Notion-style capabilities by configuring the `features` prop.

```tsx
import { AxiomEditor } from 'axiom-editor';

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
Axiom's paste rules are highly granular. 
- Want users to be able to paste YouTube links as plain text without them turning into giant videos? Set `pasteRules.embeds = false`.
- Want to keep the custom `Source Pill` auto-formatting active? Keep `pasteRules.sourceLink = true`.

---

## 🤖 Features & Operations

1. **AI Copilot (`AxiomAICopilot.tsx`)**
   - Highlighting text and selecting **"Ask AI"** from the floating Bubble Menu brings up the Copilot Sidebar.
   - Built to handle prompts like "Summarize this", "Improve phrasing", or "Fix grammar".
   - *Architecture*: Intercepts Tiptap editor state, reads the highlighted selection, and replaces it with AI-generated responses (backend hook required).

2. **Slash Menu (`/`)**
   - Typing `/` anywhere on a blank line triggers a floating Command List.
   - *Customization*: You can disable this entirely via `features.slashCommands = false`. It intelligently tracks your cursor and prevents overflow off the screen.

3. **Interactive Media Blocks**
   - Supports Tweets, YouTube, Instagram, and native Images.
   - Clicking on a media block (or Poll) opens a dedicated floating **Media Menu** allowing users to align the block (Left, Center, Right) or resize it (25%, 50%, 100%).

4. **Source Pills (`/cite`)**
   - A custom Markdown-style syntax parser. 
   - Typing `/cite-("Google"|"google.com")` instantly replaces the text with a gorgeous, un-editable interactive UI pill.

---

## 🏗️ Architecture Under the Hood

- **Tiptap Core**: Axiom leverages Tiptap's headless architecture. We define custom `Node` and `Mark` extensions in the `/src/extensions/` directory.
- **React NodeViews**: Complex blocks like Polls, Tweets, and Callouts are rendered using Tiptap's `ReactNodeViewRenderer`. This allows us to put fully functional, interactive React components inside the rich-text editor!
- **State Management**: The editor uses a unified `AxiomEditorContext` to distribute feature flags, AI handlers, and the active `Editor` instance to the Toolbar, Bubble Menu, and extensions.