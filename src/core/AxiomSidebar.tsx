import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { useAxiomEditor } from './AxiomEditorContext';
import DOMPurify from 'dompurify';

export const AxiomSidebar: React.FC = () => {
  const { editor, sidebarOpen, setSidebarOpen, features } = useAxiomEditor();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  if (!sidebarOpen) return null;

  const aiProvider = typeof features?.aiCopilot === 'object' ? features.aiCopilot.provider : null;

  const handleAsk = async (presetPrompt?: string) => {
    if (!aiProvider || !editor) return;
    const finalPrompt = presetPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      // Get the full document text for context
      const docContext = editor.getText();
      const fullPrompt = `Document Context:\n"""\n${docContext}\n"""\n\nUser Request: ${finalPrompt}\nRespond ONLY with the text content, no markdown blocks, formatted nicely with basic HTML tags if needed.`;
      
      const res = await aiProvider(fullPrompt);
      setResponse(DOMPurify.sanitize(res, { ADD_TAGS: ['b', 'i', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'br'] }));
    } catch (err) {
      console.error(err);
      setResponse('An error occurred while generating the response.');
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  const handleInsert = () => {
    if (response && editor) {
      editor.chain().focus().insertContent(response).run();
    }
  };

  return (
    <div className="w-80 axiom-bg-card border-l axiom-border flex flex-col transition-all duration-300 relative z-20">
      <div className="p-4 border-b axiom-border flex items-center justify-between axiom-bg">
        <div className="flex items-center gap-2 font-display font-semibold" style={{ color: 'var(--axiom-primary)' }}>
          <Sparkles className="w-4 h-4" />
          <span>Document AI</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="axiom-text-muted hover:opacity-80 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {!response && !loading && (
          <div className="space-y-2">
            <button onClick={() => handleAsk("Summarize this document in 3 bullet points.")} className="w-full text-left p-3 rounded-lg border axiom-border hover:bg-white/10 text-sm axiom-text transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              Summarize Document
            </button>
            <button onClick={() => handleAsk("Identify any grammatical errors or awkward phrasing.")} className="w-full text-left p-3 rounded-lg border axiom-border hover:bg-white/10 text-sm axiom-text transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              Proofread Document
            </button>
            <button onClick={() => handleAsk("Suggest a compelling title and subtitle based on the content.")} className="w-full text-left p-3 rounded-lg border axiom-border hover:bg-white/10 text-sm axiom-text transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
              Suggest Titles
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-8" style={{ color: 'var(--axiom-primary)' }}>
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {response && !loading && (
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none axiom-text" dangerouslySetInnerHTML={{ __html: response }} />
            <button onClick={handleInsert} className="w-full py-2 axiom-primary-bg font-medium text-sm rounded-lg transition-colors mt-4">
              Insert at Cursor
            </button>
            <button onClick={() => setResponse(null)} className="w-full py-2 axiom-text-muted hover:opacity-80 text-sm transition-opacity mt-1">
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t axiom-border axiom-bg">
        <div className="flex items-center gap-2 axiom-input border axiom-border rounded-xl px-3 py-2 transition-colors" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <input 
            type="text" 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            placeholder="Ask AI about the doc..."
            className="flex-1 w-full bg-transparent text-sm axiom-text focus:outline-none"
            disabled={loading || !aiProvider}
          />
          <button onClick={() => handleAsk()} disabled={!prompt.trim() || loading || !aiProvider} style={{ color: 'var(--axiom-primary)' }} className="hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!aiProvider && (
          <p className="text-[10px] text-red-500 mt-2 text-center">AI Provider not configured.</p>
        )}
      </div>
    </div>
  );
};
