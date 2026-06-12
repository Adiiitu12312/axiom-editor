import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { CommandItemProps } from './commands';

export interface CommandListProps {
  items: CommandItemProps[];
  command: (item: CommandItemProps) => void;
  query?: string;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return null;
  }

  return (
    <div className="bg-obsidian border border-smoke/60 shadow-2xl rounded-xl overflow-hidden flex flex-col min-w-[240px] max-h-[280px]">
      {/* Search Header */}
      <div className="px-3.5 py-2 border-b border-smoke/20 bg-charcoal/20 flex items-center gap-2 select-none text-[11px] text-steel">
        <span className="font-semibold text-amber">/</span>
        {props.query ? (
          <span className="truncate">Searching: <strong className="text-bone">"{props.query}"</strong></span>
        ) : (
          <span>Type to search...</span>
        )}
      </div>

      {/* Scrollable Command List */}
      <div 
        ref={listRef}
        className="overflow-y-auto py-1.5 flex-1 custom-scrollbar"
      >
        {props.items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              className={`w-full flex items-center gap-2.5 px-3.5 py-1.5 text-left transition-colors
                ${index === selectedIndex ? 'bg-amber/10 text-amber' : 'text-bone hover:bg-charcoal/50 hover:text-amber/80'}`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded bg-charcoal/30 border border-smoke/30 shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs font-display tracking-wide">{item.title}</span>
                <span className="text-[10px] text-steel leading-tight">{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

CommandList.displayName = 'CommandList';
 
 
 