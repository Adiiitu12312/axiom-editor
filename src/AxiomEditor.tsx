import React from 'react';
import type { JSONContent } from '@tiptap/core';
import { AxiomEditorProvider } from './core/AxiomEditorProvider';
import type { AxiomFeaturesConfig } from './core/AxiomEditorContext';
import { AxiomToolbar } from './toolbar/Toolbar';
import { AxiomContent } from './core/AxiomEditorContent';
import { MediaMenu } from './toolbar/MediaMenu';

export interface AxiomEditorProps {
  initialContent: JSONContent | string;
  onChange?: (json: JSONContent, html: string) => void;
  uploadImage?: (file: File) => Promise<string>;
  minHeight?: string | number;
  maxHeight?: string | number;
  height?: string | number;
  hideEmbeds?: boolean;
  features?: AxiomFeaturesConfig;
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
  minHeight,
  maxHeight,
  height,
  features,
  // Note: hideEmbeds can be passed into the toolbar if needed, 
  // but for now we just use the default modular toolbar.
}) => {
  return (
    <AxiomEditorProvider 
      initialContent={initialContent} 
      onChange={onChange} 
      uploadImage={uploadImage}
      minHeight={minHeight}
      maxHeight={maxHeight}
      height={height}
      features={features}
    >
      <div className="axiom-editor-wrapper flex flex-col gap-4">
        <AxiomToolbar />
        <AxiomContent />
        <MediaMenu />
      </div>
    </AxiomEditorProvider>
  );
};
 
 
 