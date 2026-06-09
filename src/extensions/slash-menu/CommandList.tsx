import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { CommandItemProps } from './commands';

export interface CommandListProps {
  items: CommandItemProps[];
  command: (item: CommandItemProps) => void;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    <div className="bg-obsidian border border-smoke/60 shadow-2xl rounded-xl overflow-hidden py-2 min-w-[240px]">
      {props.items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
              ${index === selectedIndex ? 'bg-amber/10 text-amber' : 'text-bone hover:bg-charcoal/50 hover:text-amber/80'}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-charcoal/30 border border-smoke/30 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm font-display tracking-wide">{item.title}</span>
              <span className="text-xs text-steel">{item.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
});

CommandList.displayName = 'CommandList';
