import { createContext, useContext } from 'react';
import { Editor } from '@tiptap/react';

export interface AxiomEditorContextType {
  editor: Editor | null;
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
}

export const AxiomEditorContext = createContext<AxiomEditorContextType | undefined>(undefined);

export const useAxiomEditor = () => {
  const context = useContext(AxiomEditorContext);
  if (context === undefined) {
    throw new Error('useAxiomEditor must be used within an AxiomEditorProvider');
  }
  return context;
};
