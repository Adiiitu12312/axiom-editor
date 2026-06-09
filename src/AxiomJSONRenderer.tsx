import React from 'react';
import type { JSONContent } from '@tiptap/core';

interface AxiomJSONRendererProps {
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
        if (mark.type === 'link') {
          const href = mark.attrs?.href;
          if (href) textElement = <a key={mark.type} href={href} target="_blank" rel="noopener noreferrer" className="text-amber hover:text-amber/80 transition-colors underline underline-offset-4">{textElement}</a>;
        }
      });
    }
    return <React.Fragment key={key}>{textElement}</React.Fragment>;
  }

  const children = node.content?.map((child, i) => renderNode(child, i));
  const attrs = node.attrs || {};
  const textAlign = attrs.textAlign ? { textAlign: attrs.textAlign as any } : {};

  switch (node.type) {
    case 'paragraph': return <p key={key} style={textAlign}>{children}</p>;
    case 'heading': {
      const Level = `h${attrs.level || 1}` as any;
      return <Level key={key} style={textAlign}>{children}</Level>;
    }
    case 'blockquote': return <blockquote key={key} className="border-l-4 border-amber/50 pl-4 py-1 italic bg-charcoal/30 rounded-r-lg">{children}</blockquote>;
    case 'bulletList': return <ul key={key} className="list-disc pl-6 marker:text-amber">{children}</ul>;
    case 'orderedList': return <ol key={key} className="list-decimal pl-6 marker:text-amber">{children}</ol>;
    case 'listItem': return <li key={key}>{children}</li>;
    case 'image': {
      const align = attrs.align || 'center';
      const width = attrs.width || '100%';
      let alignClass = 'items-center mx-auto';
      if (align === 'left') alignClass = 'items-start mr-auto ml-0';
      if (align === 'right') alignClass = 'items-end ml-auto mr-0';
      
      return (
        <div key={key} className={`flex flex-col my-8 w-full ${alignClass}`}>
          {attrs.caption && attrs.captionPosition === 'above' && <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{attrs.caption}</p>}
          <img src={attrs.src} alt={attrs.alt || ''} title={attrs.title} style={{ width, minWidth: '150px' }} className="rounded-xl object-cover shadow-2xl border border-smoke/30 max-w-full" />
          {attrs.caption && attrs.captionPosition === 'below' && <p className="text-steel text-xs md:text-sm italic mt-3 uppercase tracking-widest font-medium px-2">{attrs.caption}</p>}
        </div>
      );
    }
    case 'youtube': return (
      <div key={key} className="my-8 aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-smoke/30 bg-black relative">
        <iframe src={attrs.src} className="absolute inset-0 w-full h-full border-0" allowFullScreen />
      </div>
    );
    case 'tweet': return <div key={key} className="my-6"><blockquote className="twitter-tweet"><a href={attrs.url}></a></blockquote></div>;
    case 'instagram': return <div key={key} className="my-6"><blockquote className="instagram-media" data-instgrm-permalink={attrs.url}></blockquote></div>;
    
    case 'callout': {
      const typeStyles = {
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100',
        error: 'bg-red-500/10 border-red-500/30 text-red-100',
      };
      const currentStyle = typeStyles[attrs.type as keyof typeof typeStyles] || typeStyles.info;
      return (
        <div key={key} className={`my-6 flex gap-4 p-4 md:p-5 rounded-2xl border shadow-md ${currentStyle}`}>
          <div className="text-2xl shrink-0 mt-0.5 select-none">{attrs.emoji}</div>
          <div className="flex-1 font-medium leading-relaxed">{children}</div>
        </div>
      );
    }
    
    case 'codeBlock':
      return (
        <pre key={key} className="bg-obsidian border border-smoke/30 p-4 rounded-xl overflow-x-auto text-sm my-6 font-mono text-steel">
          <code className={`language-${attrs.language || 'plaintext'}`}>{children}</code>
        </pre>
      );
      
    case 'taskList':
      return <ul key={key} className="list-none pl-0 my-6 space-y-2" data-type="taskList">{children}</ul>;
      
    case 'taskItem':
      return (
        <li key={key} className="flex items-start gap-3" data-type="taskItem">
          <input type="checkbox" className="mt-1.5 w-4 h-4 rounded border-smoke/30 bg-charcoal text-amber accent-amber cursor-not-allowed" checked={attrs.checked} readOnly />
          <div className="flex-1 text-bone">{children}</div>
        </li>
      );

    // SECURITY: Stash notes are explicitly ignored and stripped out of the render output.
    // They will never reach the reader's screen.
    case 'stash': return null; 
    
    default: return <React.Fragment key={key}>{children}</React.Fragment>;
  }
};

export const AxiomJSONRenderer: React.FC<AxiomJSONRendererProps> = ({ content }) => {
  // We use the same typography classes as the editor so it looks identical
  return (
    <div className="prose prose-invert max-w-none text-bone font-body leading-relaxed prose-p:my-1 prose-headings:my-4">
      {renderNode(content)}
    </div>
  );
};
