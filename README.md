# Axiom Editor

A premium, highly-customizable rich-text narrative architecture block editor built on top of [Tiptap](https://tiptap.dev).

## Installation

```bash
npm install axiom-editor
```
*(Peer dependencies: `react`, `react-dom`)*

## Quick Start

```tsx
import { useState } from 'react';
import { AxiomEditor } from 'axiom-editor';
import 'axiom-editor/style.css';

export default function App() {
  const [json, setJson] = useState({});
  const [html, setHtml] = useState('');

  return (
    <AxiomEditor 
      initialContent={json}
      onChange={(newJson, newHtml) => {
        setJson(newJson);
        setHtml(newHtml);
      }}
      height={650}
    />
  );
}
```

---

## 🎨 Theme Customisation Guide

Axiom Editor is fully themeable using plain CSS variables. You can override the default colors to match any application theme by declaring these variables in your parent container or wrapping CSS class.

### Available CSS Variables

```css
.my-custom-theme {
  --axiom-bg: #0a0a0a;          /* Main editor background */
  --axiom-bg-card: #171717;     /* Background for sidebars, toolbars, and modals */
  --axiom-text: #f5f5f5;        /* Primary text color */
  --axiom-text-muted: #a3a3a3;  /* Muted text (placeholders, secondary icons) */
  --axiom-border: #404040;      /* Border colors for dividers and panels */
  --axiom-primary: #f59e0b;     /* Primary accent color (active buttons, highlights) */
}
```

### Usage

Just apply your theme class to the container wrapping the editor:

```tsx
<div className="my-custom-theme">
  <AxiomEditor />
</div>
```

---

## ⚙️ Feature Customisation Guide

Axiom Editor ships with 4 massive "Next-Gen" features. Because Axiom is unopinionated about your backend, **all of these features are entirely optional** and customizable via the `features` prop.

You can toggle each feature on or off:

```tsx
<AxiomEditor 
  features={{
    collaboration: false, // Set to an object to enable
    poll: true,           // Native Live Polls (Default: true)
    dragDrop: true,       // Notion-style Block Reordering (Default: true)
    aiCopilot: false,     // Set to an object to enable Full-Document AI
  }}
/>
```

### 1. Multiplayer Real-time Collaboration (Yjs)
Inject any Yjs provider (e.g., Supabase, WebRTC, Hocuspocus) to enable instant Google Docs-style collaboration with live cursors.

```tsx
import * as Y from 'yjs';
import { SupabaseProvider } from 'y-supabase';

const ydoc = new Y.Doc();
const provider = new SupabaseProvider(ydoc, supabaseClient, { channel: 'my-room' });

<AxiomEditor 
  features={{
    collaboration: {
      document: ydoc,
      provider: provider,
      user: { name: 'Alice', color: '#ffbf00' }
    }
  }}
/>
```

### 2. Full-Document AI Sidebar
The AI Copilot operates purely via a callback. You provide an async function that calls your preferred LLM backend (OpenAI, Anthropic, or a custom API). Axiom handles the sliding sidebar UI, prompts, loading states, and inserting the response.

```tsx
<AxiomEditor 
  features={{
    aiCopilot: {
      provider: async (prompt) => {
        // Post the prompt to your own secure backend
        const response = await fetch('/api/my-llm', { body: JSON.stringify({ prompt }) });
        return await response.text();
      }
    }
  }}
/>
```

### 3. Interactive Live Polls
A native Poll block that syncs votes across multiplayer clients without needing a dedicated polling backend (relies on Yjs state).
- Enabled by default if you don't pass `features.poll = false`.

### 4. Notion-Style Drag & Drop
Hover over any block to reveal a 6-dot drag handle to easily reorder content.
- Enabled by default if you don't pass `features.dragDrop = false`.

---

## 🔒 Environment Variables Guide

While the `axiom-editor` NPM package itself **does not read `.env` files** (it is a pure React component), the application consuming it (e.g. your Next.js or Vite app) will likely need environment variables to power the backend providers for the features mentioned above.

Here are the typical environment variables your host application should configure:

```env
# 1. SUPABASE (For Multiplayer Collaboration & Sync)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# 2. CLOUDINARY (For Image Uploads)
# Pass the resulting signed URLs into the editor's uploadImage prop.
VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name"
VITE_CLOUDINARY_API_KEY="your-api-key"
VITE_CLOUDINARY_API_SECRET="your-api-secret"

# 3. OPENAI / LLM (For AI Sidebar)
# Keep this on your backend! Do not expose this in Vite/Next.js frontend.
OPENAI_API_KEY="sk-..."
```

---

## Advanced Rendering (SSR/SSG)
Axiom provides an AST renderer out of the box so you don't need to dangerously set HTML:
```tsx
import { AxiomJSONRenderer } from 'axiom-editor';

<AxiomJSONRenderer content={savedJsonData} />
```

## License
MIT