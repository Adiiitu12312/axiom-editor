import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useAxiomEditor } from './AxiomEditorContext';

export const AxiomContent: React.FC = () => {
  const { editor } = useAxiomEditor();

  if (!editor) return null;

  return (
    <div className={`axiom-editor-canvas relative rounded-xl overflow-y-auto overflow-x-hidden shadow-inner transition-colors duration-300 custom-scrollbar axiom-editor-fixed-size min-h-0 axiom-bg axiom-text axiom-border`}>
      <EditorContent editor={editor} className="min-h-full" />
    </div>
  );
};
