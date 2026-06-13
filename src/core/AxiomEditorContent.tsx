import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useAxiomEditor } from './AxiomEditorContext';
import { AxiomBubbleMenu } from './AxiomBubbleMenu';
import { AxiomFindReplace } from './AxiomFindReplace';
import { AxiomAICopilot } from './AxiomAICopilot';
import { AxiomSidebar } from './AxiomSidebar';

export const AxiomContent: React.FC = () => {
  const { 
    editor, 
    features,
    minHeight, 
    maxHeight, 
    height, 
    findReplaceOpen, 
    setFindReplaceOpen,
    aiCopilotOpen,
    setAICopilotOpen,
    aiSelectedText,
    setAISelectedText
  } = useAxiomEditor();

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
      className="flex w-full relative axiom-bg axiom-border rounded-xl transition-all duration-300"
    >
      <div 
        className="flex-1 axiom-editor-canvas relative overflow-y-auto overflow-x-hidden shadow-inner custom-scrollbar min-h-0 h-full axiom-bg axiom-text"
      >
        <EditorContent editor={editor} className="min-h-full" />
        {features?.bubbleMenu !== false && (
          <AxiomBubbleMenu 
            editor={editor} 
            onAskAI={(text) => {
              setAISelectedText(text);
              setAICopilotOpen(true);
            }}
          />
        )}
      </div>

      <AxiomSidebar />

      {features?.findReplace !== false && (
        <AxiomFindReplace 
          editor={editor} 
          isOpen={findReplaceOpen} 
          onClose={() => setFindReplaceOpen(false)} 
        />
      )}
      {features?.aiCopilot !== false && (
        <AxiomAICopilot 
          editor={editor}
          isOpen={aiCopilotOpen}
          onClose={() => setAICopilotOpen(false)}
          selectedText={aiSelectedText}
        />
      )}
    </div>
  );
};
 
 
 