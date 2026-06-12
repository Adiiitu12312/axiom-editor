import { createContext, useContext } from 'react';
import { Editor } from '@tiptap/react';

export interface AxiomFeaturesConfig {
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
    document: any; // Y.Doc
    provider: any; // WebRTC or Supabase provider
    user: { name: string; color: string; };
  } | false;
  bubbleMenu?: boolean | {
    items?: string[]; // e.g. ['bold', 'italic', 'h1', 'image']
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
 
 
 