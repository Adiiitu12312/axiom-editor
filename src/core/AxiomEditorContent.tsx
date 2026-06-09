import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useAxiomEditor } from './AxiomEditorContext';

export const AxiomContent: React.FC = () => {
  const { editor, minHeight, maxHeight, height } = useAxiomEditor();

  if (!editor) return null;

  const formatStyleValue = (val: string | number | undefined) => {
    if (typeof val === 'number') return `${val}px`;
    return val;
  };

  const hasSizeProps = height !== undefined || minHeight !== undefined || maxHeight !== undefined;

  const inlineStyles: React.CSSProperties = {
    minHeight: formatStyleValue(minHeight),
    maxHeight: formatStyleValue(maxHeight),
    height: formatStyleValue(hasSizeProps ? height : 650),
  };

  return (
    <div 
      style={inlineStyles}
      className="axiom-editor-canvas relative rounded-xl overflow-y-auto overflow-x-hidden shadow-inner transition-colors duration-300 custom-scrollbar min-h-0 axiom-bg axiom-text axiom-border"
    >
      <EditorContent editor={editor} className="min-h-full" />
    </div>
  );
};
