import { createContext, useContext } from 'react';
import { Editor } from '@tiptap/react';
import type * as Y from 'yjs';
import type { HocuspocusProvider } from '@hocuspocus/provider';

export interface AxiomFeaturesConfig {
  // Core Extensions (In-Depth Disabling)
  undo?: boolean;          // default: true
  redo?: boolean;          // default: true
  bold?: boolean;          // default: true
  italic?: boolean;        // default: true
  underline?: boolean;     // default: true
  strike?: boolean;        // default: true
  textColor?: boolean;     // default: true
  link?: boolean;          // default: true
  heading?: boolean;       // default: true (handles h1, h2, h3)
  blockquote?: boolean;    // default: true
  codeBlock?: boolean;     // default: true
  list?: boolean;          // default: true (handles bulletList, orderedList, taskList)
  align?: boolean;         // default: true (handles alignLeft, alignCenter, alignRight)
  image?: boolean;         // default: true

  // Premium Features
  slashCommands?: boolean; // default: true
  aiCopilot?: boolean | { provider: (prompt: string) => Promise<string> };
  findReplace?: boolean;   // default: true
  characterCount?: boolean;// default: true
  tableOfContents?: boolean;// default: true
  callout?: boolean;       // default: true
  stash?: boolean;         // default: true
  sourceLink?: boolean;    // default: true
  poll?: boolean;          // default: true
  dragDrop?: boolean;      // default: true
  embeds?: boolean | {
    youtube?: boolean;
    tweet?: boolean;
    instagram?: boolean;
  };
  collaboration?: {
    document: Y.Doc;
    provider: HocuspocusProvider | any; // Supports Hocuspocus, WebRTC, or Supabase provider
    user: { name: string; color: string; };
  } | false;
  bubbleMenu?: boolean | {
    items?: string[]; // e.g. ['bold', 'italic', 'h1', 'image']
  };
  toolbar?: boolean | {
    items?: string[]; // e.g. ['undo', 'redo', 'bold', 'italic', 'h1', 'image']
  };
  pasteRules?: boolean | {
    embeds?: boolean;      // Disables auto-embeds for youtube, tweet, instagram
    sourceLink?: boolean;  // Disables regex text formatting for source pills
  };
}

export interface AxiomEditorContextType {
  editor: Editor | null;
  features?: AxiomFeaturesConfig;
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
  mediaModalOpen: boolean;
  setMediaModalOpen: (open: boolean) => void;
  mediaModalType: 'link' | 'video' | 'tweet' | 'instagram';
  setMediaModalType: (type: 'link' | 'video' | 'tweet' | 'instagram') => void;
  mediaModalInput: string;
  setMediaModalInput: (input: string) => void;
  uploadImage?: (file: File) => Promise<string>;
  minHeight?: string | number;
  maxHeight?: string | number;
  height?: string | number;
  findReplaceOpen: boolean;
  setFindReplaceOpen: (open: boolean) => void;
  aiCopilotOpen: boolean;
  setAICopilotOpen: (open: boolean) => void;
  aiSelectedText: string;
  setAISelectedText: (text: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AxiomEditorContext = createContext<AxiomEditorContextType | undefined>(undefined);

export const useAxiomEditor = () => {
  const context = useContext(AxiomEditorContext);
  if (context === undefined) {
    throw new Error('useAxiomEditor must be used within an AxiomEditorProvider');
  }
  return context;
};
 
 
  