import React from 'react';
import type { JSONContent } from '@tiptap/core';
import { CursusEditorProvider } from './core/CursusEditorProvider';
import type { AxiomFeaturesConfig } from './core/AxiomEditorContext';
import { AxiomToolbar } from './toolbar/Toolbar';
import { AxiomContent } from './core/AxiomEditorContent';

export interface CursusEditorProps {
  initialContent: JSONContent | string;
  onChange?: (json: JSONContent, html: string) => void;
  minHeight?: string | number;
  maxHeight?: string | number;
  height?: string | number;
  features?: AxiomFeaturesConfig;
  maxLines?: number;
  maxChars?: number;
  maxCharsPerLine?: number;
}

/**
 * Lightweight Cursus Editor Wrapper
 * Fully API compatible with AxiomEditor (uses the same features config object)
 * but relies on a stripped-down provider.
 */
export const CursusEditor: React.FC<CursusEditorProps> = ({
  initialContent,
  onChange,
  minHeight,
  maxHeight,
  height,
  features,
  maxLines,
  maxChars,
  maxCharsPerLine,
}) => {
  return (
    <CursusEditorProvider 
      initialContent={initialContent} 
      onChange={onChange} 
      minHeight={minHeight}
      maxHeight={maxHeight}
      height={height}
      features={features}
      maxLines={maxLines}
      maxChars={maxChars}
      maxCharsPerLine={maxCharsPerLine}
    >
      <div className="axiom-editor-wrapper flex flex-col gap-4">
        {features?.toolbar !== false && <AxiomToolbar />}
        <AxiomContent />
      </div>
    </CursusEditorProvider>
  );
};
