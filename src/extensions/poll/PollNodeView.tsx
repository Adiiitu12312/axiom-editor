import React, { useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { BarChart3, Plus, X, Trash2 } from 'lucide-react';
import type { PollOption } from './index';

export const PollNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, editor, selected }) => {
  const { question, options, votes } = node.attrs as { question: string, options: PollOption[], votes: Record<string, number> };
  const isEditable = editor.isEditable;
  const [isEditing, setIsEditing] = useState(false);

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleVote = (optionId: string) => {
    if (isEditing) return;
    const newVotes = { ...votes };
    newVotes[optionId] = (newVotes[optionId] || 0) + 1;
    updateAttributes({ votes: newVotes });
  };

  const handleAddOption = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    updateAttributes({ options: [...options, { id: newId, text: `Option ${options.length + 1}` }] });
  };

  const handleUpdateOption = (id: string, text: string) => {
    const newOptions = options.map(o => o.id === id ? { ...o, text } : o);
    updateAttributes({ options: newOptions });
  };

  const handleRemoveOption = (id: string) => {
    const newOptions = options.filter(o => o.id !== id);
    const newVotes = { ...votes };
    delete newVotes[id];
    updateAttributes({ options: newOptions, votes: newVotes });
  };

  return (
    <NodeViewWrapper className={`w-full my-6 max-w-xl mx-auto rounded-2xl border ${selected ? 'border-amber ring-1 ring-amber shadow-[0_0_20px_rgba(255,191,0,0.15)]' : 'border-smoke/40 shadow-xl'} bg-zinc-900/80 backdrop-blur-md overflow-hidden transition-all duration-300 relative group`}>
      
      {/* Poll Header */}
      <div className="flex items-center gap-3 p-4 border-b border-smoke/30 bg-zinc-950/50">
        <div className="p-2 rounded-lg bg-amber/10 text-amber">
          <BarChart3 className="w-5 h-5" />
        </div>
        {isEditing ? (
          <input 
            type="text" 
            value={question}
            onChange={(e) => updateAttributes({ question: e.target.value })}
            className="flex-1 bg-transparent text-lg font-display font-bold text-bone focus:outline-none placeholder:text-steel"
            placeholder="Ask a question..."
            autoFocus
          />
        ) : (
          <h3 className="flex-1 text-lg font-display font-bold text-bone m-0">{question}</h3>
        )}
      </div>

      {/* Options */}
      <div className="p-4 space-y-3">
        {options.map((option) => {
          const voteCount = votes[option.id] || 0;
          const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);

          return (
            <div key={option.id} className="relative">
              {isEditing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="text" 
                    value={option.text}
                    onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                    className="flex-1 bg-black/40 border border-smoke/50 rounded-xl px-4 py-2.5 text-sm text-bone focus:outline-none focus:border-amber transition-colors"
                  />
                  <button onClick={() => handleRemoveOption(option.id)} className="p-2.5 text-steel hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleVote(option.id)}
                  disabled={!isEditable}
                  className="w-full relative group/btn text-left overflow-hidden rounded-xl border border-smoke/30 bg-black/20 hover:border-amber/50 hover:bg-black/40 transition-all duration-300 p-3 min-h-[52px] flex items-center justify-between z-10"
                >
                  {/* Progress Bar Background */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-amber/15 transition-all duration-700 ease-out z-0" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                  
                  {/* Content */}
                  <span className="relative z-10 text-sm font-medium text-bone group-hover/btn:text-white transition-colors">{option.text}</span>
                  <span className="relative z-10 text-xs font-bold text-steel group-hover/btn:text-amber transition-colors">
                    {voteCount > 0 ? `${percentage}% (${voteCount})` : ''}
                  </span>
                </button>
              )}
            </div>
          );
        })}

        {isEditing && (
          <button onClick={handleAddOption} className="flex items-center gap-2 text-sm font-semibold text-amber hover:text-amber/80 transition-colors py-2 px-1">
            <Plus className="w-4 h-4" /> Add Option
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-smoke/20 bg-zinc-950/80 flex items-center justify-between text-xs font-medium text-steel">
        <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
        
        {isEditable && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black hover:text-amber border border-smoke/40 transition-all"
            >
              {isEditing ? 'Done' : 'Edit Poll'}
            </button>
            <button 
              onClick={() => deleteNode()}
              className="px-2 py-1.5 rounded-lg bg-black/40 hover:bg-red-500/20 hover:text-red-400 border border-smoke/40 transition-all"
              title="Delete Poll"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </NodeViewWrapper>
  );
};
