 
import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Check, Copy } from 'lucide-react';

const COMMON_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash/Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'java', label: 'Java' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' }
];

export const CodeBlockNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const [copied, setCopied] = useState(false);
  const currentLang = node.attrs.language || 'javascript';

  // Handle code copying
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Split content by newlines to calculate line count
  const lines = (node.textContent || '').split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Line height styling to keep gutter and code perfectly aligned
  const lineStyle: React.CSSProperties = {
    lineHeight: '22px',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, Consolas, monospace',
  };

  return (
    <NodeViewWrapper className="axiom-premium-code-block my-6 rounded-xl overflow-hidden border border-smoke/40 shadow-2xl bg-[#1e1e24]">
      {/* Header Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2.5 bg-[#141416] border-b border-smoke/20 select-none"
        contentEditable={false}
      >
        {/* Mock Mac Window Controls */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] block" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] block" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] block" />
        </div>

        {/* Actions (Language Selector & Copy Button) */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <select
            value={currentLang}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="bg-[#2a2a32]/60 border border-smoke/30 rounded-md px-2.5 py-1 text-[11px] text-bone font-medium focus:outline-none focus:border-amber/80 transition-colors cursor-pointer select-none"
          >
            {COMMON_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-[#1e1e24] text-bone">
                {lang.label}
              </option>
            ))}
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all duration-300 active:scale-95
              ${copied 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                : 'bg-[#2a2a32]/60 border-smoke/30 text-steel hover:text-bone hover:border-smoke/60'
              }`}
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check size={12} className="animate-scale-up" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Canvas Container */}
      <div className="flex relative items-stretch min-h-[50px]">
        {/* Gutter (Line Numbers) */}
        <div 
          className="axiom-code-gutter select-none text-right pr-3.5 pl-4 py-3 text-steel/45 bg-[#17171a] border-r border-smoke/10 flex flex-col min-w-[3rem]"
          contentEditable={false}
          style={lineStyle}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <span key={i} className="block min-h-[22px] font-mono">
              {i + 1}
            </span>
          ))}
        </div>

        {/* Editable Pre-Code Area */}
        <pre className="flex-1 overflow-x-auto p-0 m-0 py-3 px-4 bg-[#1e1e24] custom-scrollbar">
          <NodeViewContent 
            as={"code" as any} 
            className={`language-${currentLang} block outline-none min-w-full text-bone`}
            style={lineStyle}
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
};
