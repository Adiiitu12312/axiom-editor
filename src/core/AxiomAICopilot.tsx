import React, { useState, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { Sparkles, X, Send, Sparkle } from 'lucide-react';
import DOMPurify from 'dompurify';

interface AxiomAICopilotProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

const AI_OPTIONS = [
  { name: 'Improve writing', prompt: 'Improve the flow, vocabulary, and clarity of the following text while keeping its core meaning. Output only the improved text with no introduction or extra explanation: ' },
  { name: 'Summarize text', prompt: 'Create a concise summary of the following text. Output only the summary with no introduction or extra explanation: ' },
  { name: 'Make longer', prompt: 'Expand the following text to add more details, description, and depth. Output only the expanded text with no introduction or extra explanation: ' },
  { name: 'Fix grammar & spelling', prompt: 'Correct any spelling, grammar, and punctuation mistakes in the following text. Output only the corrected text with no introduction or extra explanation: ' }
];

export const AxiomAICopilot = ({ editor, isOpen, onClose, selectedText }: AxiomAICopilotProps) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const executeAICommand = async (systemInstructions: string, textToProcess: string) => {
    let envKey = '';
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_NVIDIA_API_KEY) {
        envKey = (import.meta as any).env.VITE_NVIDIA_API_KEY as string;
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.VITE_NVIDIA_API_KEY) {
        envKey = (globalThis as any).process.env.VITE_NVIDIA_API_KEY as string;
      }
    } catch {
      // Ignore environment variable reading errors
    }

    const activeKey = envKey || '';
    if (!activeKey) {
      setErrorMsg('API key not configured. Please define VITE_NVIDIA_API_KEY in environment variables.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? '/api/nvidia/v1/chat/completions'
        : 'https://integrate.api.nvidia.com/v1/chat/completions';

      let modelName = 'meta/llama-3.1-70b-instruct';
      try {
        if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_NVIDIA_MODEL) {
          modelName = (import.meta as any).env.VITE_NVIDIA_MODEL;
        } else if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.VITE_NVIDIA_MODEL) {
          modelName = (globalThis as any).process.env.VITE_NVIDIA_MODEL;
        }
      } catch {
        // Ignore environment variable reading errors
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { 
              role: 'system', 
              content: '[PART 1: EDITOR CAPABILITIES & SEMANTIC HTML SCHEMA]\n' +
                'Format your response using clean, semantic HTML tags. The editor supports only these node mappings:\n' +
                '- Headings: <h1>, <h2>, <h3>\n' +
                '- Bold: <strong>\n' +
                '- Italic: <em>\n' +
                '- Underline: <u>\n' +
                '- Strikethrough: <s>\n' +
                '- Highlights: <mark>\n' +
                '- Lists: <ul> / <ol> with <li> children\n' +
                '- Hyperlinks: Use standard <a href="URL">text</a> to link text to web pages.\n' +
                '- Citation Sources (Source Link widget): Use /cite-("Name 1" | "URL 1")-("Name 2" | "URL 2") when introducing formal bibliography sources. You can chain multiple sources together.\n\n' +
                '[PART 2: AUTHOR PERSONA & OUTPUT CONSTRAINTS]\n' +
                '- You are a premier, world-class editor, novelist, and investigative journalist. Craft brilliant, publication-ready prose with impeccable phrasing, structure, and flow.\n' +
                '- Formatting Balance: Apply styling (such as highlights, underlines, lists, and citations) naturally and balanced where appropriate — neither overusing them to clutter the article, nor underusing them to make it look monotonous.\n' +
                '- Output ONLY the finalized narrative text as raw HTML. Do NOT wrap the response in markdown code blocks (such as ```) and do NOT include any greetings, conversational chatter, or meta-explanations.'
            },
            { 
              role: 'user', 
              content: '[PART 3: USER INSTRUCTION]\n' +
                `Follow these writing instructions:\n"${systemInstructions}"\n\nTEXT TO PROCESS:\n"${textToProcess}"` 
            }
          ],
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseText = data?.choices?.[0]?.message?.content || '';

      if (!responseText) {
        throw new Error('AI returned an empty response.');
      }

      let parsedResponse = responseText.trim();
      parsedResponse = parsedResponse.replace(
        /\/cite-((?:\(['"][^'"]+['"]\s*\|\s*['"][^'"]+['"]\)-?)+)/g,
        (_match: string, content: string) => {
          const sourceRegex = /\(['"]([^'"]+)['"]\s*\|\s*['"]([^'"]+)['"]\)/g;
          const sources = [];
          let m;
          while ((m = sourceRegex.exec(content)) !== null) {
            sources.push({ name: m[1], url: m[2] });
          }
          if (sources.length === 0) return _match;
          return `<span data-type="source-link" data-sources='${JSON.stringify(sources)}'></span>`;
        }
      );

      // Insert structured HTML directly into Tiptap to parse tags like <h2>, <strong>, <u>, <mark>, etc.
      const safeResponse = DOMPurify.sanitize(parsedResponse, {
        ADD_TAGS: ['iframe', 'mark'], 
        ADD_ATTR: ['allowfullscreen', 'frameborder', 'src', 'data-type', 'data-sources'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
      });
      const { from, to } = editor.state.selection;
      editor.chain().focus().insertContentAt({ from, to }, safeResponse).run();
      setLoading(false);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'API request failed.';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    executeAICommand(customPrompt, selectedText || editor.state.doc.textContent);
    setCustomPrompt('');
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute top-16 right-4 z-50 bg-[#141416]/95 border border-[#8b5cf6]/40 rounded-xl shadow-2xl p-4 backdrop-blur-md text-bone flex flex-col gap-3 w-80 select-none border-t-2"
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-smoke/10 pb-2">
        <span className="font-semibold text-xs text-purple-400 flex items-center gap-1.5 font-display">
          <Sparkles size={13} className="text-purple-400 animate-pulse" />
          Axiom AI Assistant
        </span>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-steel hover:text-bone transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        /* Loading Shimmer State */
        <div className="flex flex-col items-center justify-center py-6 gap-3 select-none">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <Sparkle size={24} className="text-purple-400 animate-spin absolute" />
            <Sparkle size={14} className="text-purple-300 animate-ping absolute" />
          </div>
          <span className="text-xs text-purple-300/80 animate-pulse font-medium tracking-wide">
            Axiom AI is thinking...
          </span>
          {/* Shimmer loading bar */}
          <div className="w-full bg-[#1c1c20] h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 h-full animate-shimmer w-full" />
          </div>
        </div>
      ) : (
        /* Main Assistant Actions */
        <>
          {errorMsg && (
            <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg leading-normal">
              {errorMsg}
            </div>
          )}

          {selectedText && (
            <div className="bg-[#17171a]/60 border border-smoke/10 p-2.5 rounded-lg">
              <span className="text-[9px] font-bold text-steel uppercase tracking-wider block mb-1">Selected Text</span>
              <p className="text-[11px] text-bone line-clamp-3 leading-relaxed italic">
                "{selectedText}"
              </p>
            </div>
          )}

          {/* Quick AI Presets */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-steel uppercase tracking-wider px-1">Quick Edits</span>
            <div className="grid grid-cols-2 gap-1.5">
              {AI_OPTIONS.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => executeAICommand(opt.prompt, selectedText || editor.state.doc.textContent)}
                  className="px-2.5 py-2 text-left bg-[#2a2a32]/40 border border-smoke/20 hover:border-[#8b5cf6]/40 rounded-lg text-[10.5px] font-medium hover:bg-[#8b5cf6]/5 text-steel hover:text-purple-300 transition-all cursor-pointer truncate"
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Box */}
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-1.5 border-t border-smoke/10 pt-2.5">
            <span className="text-[9px] font-bold text-steel uppercase tracking-wider px-1">Custom Prompt</span>
            <div className="flex items-center gap-2 bg-[#2a2a32]/60 border border-smoke/30 rounded-md px-2.5 py-1.5 focus-within:border-[#8b5cf6]/80 transition-colors">
              <input
                type="text"
                placeholder="Ask AI to write or edit..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="bg-transparent border-0 p-0 text-xs text-bone focus:outline-none flex-1 min-w-0"
              />
              <button 
                type="submit" 
                disabled={!customPrompt.trim()} 
                className="text-purple-400 hover:text-purple-300 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
