import React from 'react';
import type { JSONContent } from '@tiptap/core';
import { AxiomEditorProvider } from './core/AxiomEditorProvider';
import { AxiomToolbar } from './toolbar/Toolbar';
import { AxiomContent } from './core/AxiomEditorContent';
import { MediaMenu } from './toolbar/MediaMenu';

export interface AxiomEditorProps {
  initialContent: JSONContent | string;
  onChange?: (json: JSONContent, html: string) => void;
  uploadImage?: (file: File) => Promise<string>;
  minHeightClass?: string;
  maxHeightClass?: string;
  hideEmbeds?: boolean;
}

/**
 * Out-of-the-box Monolithic Wrapper
 * Provided for backwards compatibility and ease of use.
 * Advanced users should compose AxiomEditorProvider, AxiomToolbar, and AxiomContent directly.
 */
export const AxiomEditor: React.FC<AxiomEditorProps> = ({
  initialContent,
  onChange,
  uploadImage,
  minHeightClass,
  maxHeightClass,
  // Note: hideEmbeds can be passed into the toolbar if needed, 
  // but for now we just use the default modular toolbar.
}) => {
  return (
    <AxiomEditorProvider 
      initialContent={initialContent} 
      onChange={onChange} 
      uploadImage={uploadImage}
      minHeightClass={minHeightClass}
      maxHeightClass={maxHeightClass}
    >
      <div className="axiom-editor-wrapper flex flex-col gap-4">
        <AxiomToolbar />
        <AxiomContent />
        <MediaMenu />
      </div>
    </AxiomEditorProvider>
  );
};
