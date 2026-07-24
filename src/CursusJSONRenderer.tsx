import React from 'react';
import type { JSONContent } from '@tiptap/core';

interface CursusJSONRendererProps {
  content: JSONContent;
}

const renderNode = (node: JSONContent, key?: string | number): React.ReactNode => {
  if (node.type === 'doc') {
    return <>{node.content?.map((child, i) => renderNode(child, i))}</>;
  }

  if (node.type === 'text') {
    let textElement: React.ReactNode = node.text || '';
    if (node.marks) {
      // Apply marks like bold, italic, color
      node.marks.forEach((mark) => {
        if (mark.type === 'bold') textElement = <strong key={mark.type}>{textElement}</strong>;
        if (mark.type === 'italic') textElement = <em key={mark.type}>{textElement}</em>;
        if (mark.type === 'underline') {
          const color = mark.attrs?.color;
          textElement = <u key={mark.type} style={color ? { textDecorationColor: color } : {}}>{textElement}</u>;
        }
        if (mark.type === 'strike') {
          const color = mark.attrs?.color;
          textElement = <s key={mark.type} style={color ? { textDecorationColor: color } : {}}>{textElement}</s>;
        }
        if (mark.type === 'textStyle') {
          const color = mark.attrs?.color;
          if (color) textElement = <span key={mark.type} style={{ color }}>{textElement}</span>;
        }
      });
    }
    return <React.Fragment key={key}>{textElement}</React.Fragment>;
  }

  const children = node.content?.map((child, i) => renderNode(child, i));
  const attrs = node.attrs || {};
  const textAlign = attrs.textAlign ? { textAlign: attrs.textAlign as React.CSSProperties['textAlign'] } : {};

  switch (node.type) {
    case 'paragraph': return <p key={key} style={textAlign}>{children}</p>;
    case 'heading': {
      const Level = `h${attrs.level || 1}` as keyof React.JSX.IntrinsicElements;
      return <Level key={key} style={textAlign}>{children}</Level>;
    }
    case 'blockquote': return <blockquote key={key} className="border-l-4 border-amber/50 pl-4 py-1 italic bg-charcoal/30 rounded-r-lg">{children}</blockquote>;
    case 'bulletList': return <ul key={key} className="list-disc pl-6 marker:text-amber">{children}</ul>;
    case 'orderedList': return <ol key={key} className="list-decimal pl-6 marker:text-amber">{children}</ol>;
    case 'listItem': return <li key={key}>{children}</li>;
    case 'horizontalRule': return <hr key={key} className="border-t border-smoke/30 my-8" />;
    case 'taskList':
      return <ul key={key} className="list-none pl-0 my-6 space-y-2" data-type="taskList">{children}</ul>;
    case 'taskItem':
      return (
        <li key={key} className="flex items-start gap-3" data-type="taskItem">
          <input type="checkbox" className="mt-1.5 w-4 h-4 rounded border-smoke/30 bg-charcoal text-amber accent-amber cursor-not-allowed" checked={attrs.checked} readOnly />
          <div className="flex-1 text-bone">{children}</div>
        </li>
      );

    default: return <React.Fragment key={key}>{children}</React.Fragment>;
  }
};

export const CursusJSONRenderer: React.FC<CursusJSONRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-bone font-body leading-relaxed prose-p:my-1 prose-headings:my-4">
      {renderNode(content)}
    </div>
  );
};
