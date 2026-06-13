import React, { useState, useEffect } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { BarChart3, Plus, X, Trash2, AlignLeft, AlignCenter, AlignRight, Maximize, Minus } from 'lucide-react';
import type { PollOption } from './index';

export const PollNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode, editor, selected }) => {
  const { question, options, votes } = node.attrs as { question: string, options: PollOption[], votes: Record<string, number> };
  const isEditable = editor.isEditable;
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSize, setIsEditingSize] = useState(false);

  const align = node.attrs.align || 'center';
  const width = node.attrs.width || '100%';

  const [sizeVal, setSizeVal] = useState(() => {
    const match = String(width).match(/^(\d+)(%|px)$/);
    return match ? { num: parseInt(match[1], 10), unit: match[2] as '%' | 'px' } : { num: 100, unit: '%' as const };
  });

  useEffect(() => {
    const match = String(node.attrs.width || '100%').match(/^(\d+)(%|px)$/);
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSizeVal({ num: parseInt(match[1], 10), unit: match[2] as '%' | 'px' });
    }
  }, [node.attrs.width]);

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

  let containerClass = "w-full my-6 flex flex-col outline-none relative group transition-all duration-300 ";
  if (align === 'left') containerClass += "items-start mr-auto ml-0";
  else if (align === 'right') containerClass += "items-end ml-auto mr-0";
  else containerClass += "items-center mx-auto";

  return (
    <NodeViewWrapper className={containerClass}>
      <div 
        className={`w-full rounded-2xl border axiom-bg-card shadow-xl overflow-hidden transition-all duration-300 relative ${selected ? 'border-[var(--axiom-primary)] ring-1 ring-[var(--axiom-primary)] shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'axiom-border'}`}
        style={{ width, maxWidth: '720px', minWidth: '320px' }}
      >
        
        {/* Poll Header */}
        <div className="flex items-center gap-3 p-4 border-b axiom-border axiom-bg">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--axiom-button-active)', color: 'var(--axiom-primary)' }}>
            <BarChart3 className="w-5 h-5" />
          </div>
          {isEditing ? (
            <input 
              type="text" 
              value={question}
              onChange={(e) => updateAttributes({ question: e.target.value })}
              className="flex-1 bg-transparent text-lg font-display font-bold axiom-text focus:outline-none placeholder:text-gray-500"
              placeholder="Ask a question..."
              autoFocus
            />
          ) : (
            <h3 className="flex-1 text-lg font-display font-bold axiom-text m-0">{question}</h3>
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
                      className="flex-1 axiom-input rounded-xl px-4 py-2.5 text-sm transition-colors"
                    />
                    <button onClick={() => handleRemoveOption(option.id)} className="p-2.5 axiom-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleVote(option.id)}
                    disabled={!isEditable}
                    className="w-full relative group/btn text-left overflow-hidden rounded-xl border axiom-border axiom-bg hover:axiom-bg-card transition-all duration-300 p-3 min-h-[52px] flex items-center justify-between z-10"
                    style={{ ':hover': { borderColor: 'var(--axiom-primary)' } } as any}
                  >
                    {/* Progress Bar Background */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 transition-all duration-700 ease-out z-0 opacity-20" 
                      style={{ width: `${percentage}%`, backgroundColor: 'var(--axiom-primary)' }}
                    ></div>
                    
                    {/* Content */}
                    <span className="relative z-10 text-sm font-medium axiom-text transition-colors">{option.text}</span>
                    <span className="relative z-10 text-xs font-bold axiom-text-muted group-hover/btn:text-[var(--axiom-primary)] transition-colors">
                      {voteCount > 0 ? `${percentage}% (${voteCount})` : ''}
                    </span>
                  </button>
                )}
              </div>
            );
          })}

          {isEditing && (
            <button onClick={handleAddOption} className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity py-2 px-1" style={{ color: 'var(--axiom-primary)' }}>
              <Plus className="w-4 h-4" /> Add Option
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 border-t axiom-border axiom-bg flex items-center justify-between text-xs font-medium axiom-text-muted">
          <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
          
          {isEditable && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-lg border axiom-border hover:bg-white/10 transition-all"
                style={isEditing ? { color: 'var(--axiom-primary)' } : {}}
              >
                {isEditing ? 'Done' : 'Edit Poll'}
              </button>
              <button 
                onClick={() => deleteNode()}
                className="px-2 py-1.5 rounded-lg border axiom-border hover:bg-red-500/20 hover:text-red-400 transition-all"
                title="Delete Poll"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div 
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 axiom-bg-card border axiom-border rounded-xl shadow-2xl flex items-center divide-x divide-white/10 h-11 px-1"
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {isEditingSize ? (
            <div className="flex items-center px-2 py-1 gap-1 axiom-input rounded-lg">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSizeVal(prev => {
                    const step = prev.unit === '%' ? 5 : 50;
                    const next = Math.max(prev.unit === '%' ? 10 : 320, prev.num - step);
                    return { ...prev, num: next };
                  });
                }}
                className="p-1 axiom-text-muted hover:text-[var(--axiom-primary)] rounded transition-colors"
                title="Decrease Size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                autoFocus
                value={sizeVal.num}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSizeVal(prev => ({ ...prev, num: isNaN(val) ? 0 : val }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const { unit } = sizeVal;
                    let { num } = sizeVal;
                    if (unit === '%') {
                      num = Math.max(10, Math.min(100, num));
                    } else {
                      num = Math.max(320, Math.min(720, num));
                    }
                    updateAttributes({ width: `${num}${unit}` });
                    setIsEditingSize(false);
                  }
                }}
                className="bg-transparent text-center text-xs axiom-text focus:outline-none w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSizeVal(prev => {
                    const step = prev.unit === '%' ? 5 : 50;
                    const next = Math.min(prev.unit === '%' ? 100 : 720, prev.num + step);
                    return { ...prev, num: next };
                  });
                }}
                className="p-1 axiom-text-muted hover:text-[var(--axiom-primary)] rounded transition-colors"
                title="Increase Size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSizeVal(prev => ({
                    num: prev.unit === '%' ? Math.round(prev.num * 5) : Math.round(prev.num / 5),
                    unit: prev.unit === '%' ? 'px' : '%'
                  }));
                }}
                className="px-1.5 py-0.5 border axiom-border rounded text-[10px] font-bold hover:opacity-80 transition-colors"
                style={{ color: 'var(--axiom-primary)' }}
              >
                {sizeVal.unit}
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  const { unit } = sizeVal;
                  let { num } = sizeVal;
                  if (unit === '%') {
                    num = Math.max(10, Math.min(100, num));
                  } else {
                    num = Math.max(320, Math.min(720, num));
                  }
                  updateAttributes({ width: `${num}${unit}` });
                  setIsEditingSize(false);
                }}
                className="text-[10px] uppercase font-bold pl-2 border-l axiom-border hover:opacity-80 transition-colors"
                style={{ color: 'var(--axiom-primary)' }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex px-1 items-center gap-0.5">
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ width: '100%' }) }} className="p-2 axiom-text-muted hover:text-[var(--axiom-primary)] rounded-lg transition-all" title="Full Width"><Maximize className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); setIsEditingSize(true) }} className="text-[10px] font-bold axiom-text-muted hover:text-[var(--axiom-primary)] px-2 py-1 transition-all">Size</button>
              </div>
              <div className="flex px-1 items-center gap-0.5">
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'left' }) }} className="p-2 axiom-text-muted hover:text-[var(--axiom-primary)] rounded-lg transition-colors"><AlignLeft className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'center' }) }} className="p-2 axiom-text-muted hover:text-[var(--axiom-primary)] rounded-lg transition-colors"><AlignCenter className="w-4 h-4" /></button>
                <button onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'right' }) }} className="p-2 axiom-text-muted hover:text-[var(--axiom-primary)] rounded-lg transition-colors"><AlignRight className="w-4 h-4" /></button>
              </div>
            </>
          )}
        </div>
      )}

    </NodeViewWrapper>
  );
};
 