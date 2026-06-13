import React, { useRef, useEffect, useState } from 'react';
import type { JSONContent } from '@tiptap/core';
import { ExternalLink, Link, Check, Copy, ChevronRight, ChevronDown, BookOpen, BarChart3 } from 'lucide-react';
import { common, createLowlight } from 'lowlight';
import { normalizeInstagramUrl, sanitizeUrl } from './utils';

const lowlight = createLowlight(common);

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
        createTweet?: (tweetId: string, element: HTMLElement, options: object) => Promise<HTMLElement>;
      };
    };
    instgrm?: {
      Embeds: {
        process: (element?: HTMLElement) => void;
      };
    };
  }
}


interface AxiomJSONRendererProps {
  content: JSONContent;
}

const RenderTweet: React.FC<{
  url?: string;
  tweetId?: string;
  align?: string;
  width?: string;
  caption?: string;
  captionPosition?: string;
  alt?: string;
}> = ({ url, tweetId: propTweetId, align = 'center', width = '100%', caption, captionPosition = 'below', alt }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  let tweetId = propTweetId;
  if (!tweetId && url) {
    const tweetMatch = url.match(/status\/(\d+)/);
    tweetId = tweetMatch ? tweetMatch[1] : '';
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.twttr) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
      script.setAttribute('async', 'true');
      script.setAttribute('charset', 'utf-8');
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (!tweetId) return;

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.twttr?.widgets) {
        clearInterval(interval);
        clearTimeout(timeout);
        if (containerRef.current && active) {
          containerRef.current.innerHTML = '';
          window.twttr.widgets.createTweet?.(tweetId, containerRef.current, {
            theme: 'dark',
            align: align || 'center',
            dnt: true
          })?.then(() => {
            if (active) setIsLoaded(true);
          });
        }
      }
    }, 100);

    const timeout = setTimeout(() => {
      active = false;
      clearInterval(interval);
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [tweetId, align]);

  let alignClass = 'items-center mx-auto';
  if (align === 'left') alignClass = 'items-start mr-auto ml-0';
  else if (align === 'right') alignClass = 'items-end ml-auto mr-0';

  return (
    <div className={`w-full relative my-8 flex flex-col ${alignClass}`} style={{ width }}>
      {caption && captionPosition === 'above' && (
        <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}
      <div 
        style={{ width: '100%', maxWidth: '550px', minWidth: '250px' }}
        className="relative py-4 flex items-center justify-center min-h-[150px] overflow-hidden bg-obsidian border border-smoke/30 rounded-xl"
        title={alt}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-steel animate-pulse uppercase tracking-wider font-semibold">
            Establishing connection to X...
          </div>
        )}
        <div ref={containerRef} className="w-full flex justify-center" />
      </div>
      {caption && captionPosition === 'below' && (
        <p className="text-steel text-xs md:text-sm italic mt-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}
    </div>
  );
};

const RenderInstagram: React.FC<{
  url?: string;
  align?: string;
  width?: string;
  caption?: string;
  captionPosition?: string;
  alt?: string;
}> = ({ url = '', align = 'center', width = '100%', caption, captionPosition = 'below', alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const normalizedUrl = normalizeInstagramUrl(url);

  useEffect(() => {
    let active = true;
    if (!normalizedUrl) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(false);

    if (!window.instgrm) {
      const script = document.createElement('script');
      script.setAttribute('src', 'https://www.instagram.com/embed.js');
      script.setAttribute('async', 'true');
      document.head.appendChild(script);
    }

    const interval = setInterval(() => {
      if (window.instgrm?.Embeds) {
        clearInterval(interval);
        clearTimeout(timeout);
        if (active) {
          window.instgrm.Embeds.process();
          setTimeout(() => {
            if (active) setIsLoaded(true);
          }, 1500);
        }
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [normalizedUrl]);

  let alignClass = 'items-center mx-auto';
  if (align === 'left') alignClass = 'items-start mr-auto ml-0';
  else if (align === 'right') alignClass = 'items-end ml-auto mr-0';

  return (
    <div className={`w-full relative my-8 flex flex-col ${alignClass}`} style={{ width }}>
      {caption && captionPosition === 'above' && (
        <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}

      <div 
        style={{ width: '100%', maxWidth: '540px', minWidth: '250px' }}
        className="relative py-4 flex items-center justify-center min-h-[150px] overflow-hidden bg-obsidian border border-smoke/30 rounded-xl transition-all"
        title={alt}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-steel animate-pulse uppercase tracking-wider font-semibold">
            Connecting to Instagram...
          </div>
        )}
        <div className="w-full flex justify-center">
          {normalizedUrl && (
            <blockquote
              key={normalizedUrl}
              className="instagram-media"
              data-instgrm-permalink={normalizedUrl}
              data-instgrm-version="14"
              style={{ width: '100%', border: '0', margin: 0, minWidth: '250px' }}
            />
          )}
        </div>
      </div>

      {caption && captionPosition === 'below' && (
        <p className="text-steel text-xs md:text-sm italic mt-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}
    </div>
  );
};

const RenderYoutube: React.FC<{
  src?: string;
  align?: string;
  width?: string;
  caption?: string;
  captionPosition?: string;
  alt?: string;
}> = ({ src = '', align = 'center', width = '100%', caption, captionPosition = 'below', alt }) => {
  let videoSrc = 'about:blank';
  const ytRegExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|live\/)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = src.match(ytRegExp);
  if (match && match[1]) {
    videoSrc = `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }

  let alignClass = 'items-center mx-auto';
  if (align === 'left') alignClass = 'items-start mr-auto ml-0';
  else if (align === 'right') alignClass = 'items-end ml-auto mr-0';

  return (
    <div className={`w-full relative my-8 flex flex-col ${alignClass}`} style={{ width }}>
      {caption && captionPosition === 'above' && (
        <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}
      <div 
        style={{ width: '100%', maxWidth: '720px', minWidth: '320px' }}
        className="relative aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-smoke/30 bg-black"
      >
        <iframe 
          src={sanitizeUrl(videoSrc)} 
          className="absolute inset-0 w-full h-full border-0" 
          title={alt} 
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allowFullScreen 
        />
      </div>
      {caption && captionPosition === 'below' && (
        <p className="text-steel text-xs md:text-sm italic mt-3 uppercase tracking-widest font-medium px-2">{caption}</p>
      )}
    </div>
  );
};

const RenderSourceLink: React.FC<{
  sources?: { name: string; url: string }[];
  color?: string;
  bgColor?: string;
}> = ({ sources = [], color = '#e4e4e7', bgColor = '#1f1f23cc' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (sources.length === 0) return null;

  const getFaviconUrl = (urlStr: string) => {
    try {
      const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return `https://www.google.com/s2/favicons?sz=64&domain=${url.hostname}`;
    } catch {
      return '';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sources.length === 1) {
      window.open(sanitizeUrl(sources[0].url), '_blank', 'noopener,noreferrer');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '9999px',
    backgroundColor: bgColor,
    color: color,
    border: 'none',
    fontSize: '12px',
    fontWeight: 500,
    userSelect: 'none',
    cursor: 'pointer',
    verticalAlign: 'middle',
    lineHeight: '1.2',
  };

  const faviconStyle: React.CSSProperties = {
    width: '14px',
    height: '14px',
    minWidth: '14px',
    minHeight: '14px',
    maxWidth: '14px',
    maxHeight: '14px',
    borderRadius: '50%',
    objectFit: 'contain',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
    display: 'inline-block',
  };

  return (
    <span className="inline relative" style={{ whiteSpace: 'normal', verticalAlign: 'middle' }}>
      <span
        onClick={handleClick}
        style={pillStyle}
        className="axiom-source-link-pill transition-all hover:scale-[1.03] active:scale-[0.98]"
      >
        {sources.length === 1 && getFaviconUrl(sources[0].url) ? (
          <img
            src={getFaviconUrl(sources[0].url)}
            alt=""
            className="axiom-source-link-favicon"
            style={faviconStyle}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <Link style={{ width: '12px', height: '12px', flexShrink: 0, color: color }} />
        )}
        <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sources[0].name || 'Source'}
        </span>
        {sources.length > 1 && (
          <span 
            style={{ 
              fontSize: '8px', 
              fontWeight: 'bold', 
              backgroundColor: color ? `${color}20` : 'rgba(245,158,11,0.2)', 
              color: color || '#f59e0b', 
              padding: '1px 4px', 
              borderRadius: '9999px',
              lineHeight: '1',
              flexShrink: 0 
            }}
          >
            +{sources.length - 1}
          </span>
        )}
      </span>

      {isOpen && (
        <span
          ref={popoverRef}
          className="absolute left-0 top-full mt-2 z-50 w-56 bg-charcoal border border-smoke rounded-xl shadow-2xl p-2.5 flex flex-col gap-1.5 text-left font-sans select-text cursor-default leading-normal"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-bold text-steel uppercase tracking-wider px-1 pb-1 border-b border-smoke/30 block">
            Citation Sources
          </span>
          <span className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {sources.map((src, i) => (
              <a
                key={i}
                href={sanitizeUrl(src.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-obsidian border border-transparent hover:border-smoke/20 text-xs text-bone transition-all"
              >
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium truncate">{src.name}</span>
                  <span className="text-[9px] text-steel truncate">{src.url}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-steel shrink-0 ml-1.5" />
              </a>
            ))}
          </span>
        </span>
      )}
    </span>
  );
};

const getCodeText = (node: JSONContent): string => {
  if (!node.content) return '';
  return node.content.map(child => child.text || '').join('');
};

function renderLowlightNode(node: any, key: string | number): React.ReactNode {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.type === 'element') {
    const className = node.properties?.className?.join(' ');
    const nestedChildren = node.children?.map((child: any, idx: number) =>
      renderLowlightNode(child, `${key}-${idx}`)
    );
    return (
      <span key={key} className={className}>
        {nestedChildren}
      </span>
    );
  }
  return null;
}

function highlightCode(codeText: string, language: string) {
  try {
    if (language && lowlight.registered(language)) {
      return lowlight.highlight(language, codeText).children;
    }
  } catch (err) {
    console.error('Failed to highlight language: ', language, err);
  }
  return [{ type: 'text', value: codeText }];
}

const RenderCodeBlock: React.FC<{
  node: JSONContent;
  attrs: any;
}> = ({ node, attrs }) => {
  const [copied, setCopied] = useState(false);
  const currentLang = attrs.language || 'javascript';
  const codeText = getCodeText(node);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed: ', err);
    }
  };

  const highlightedAST = highlightCode(codeText, currentLang);
  const highlightedElements = highlightedAST.map((childNode, idx) =>
    renderLowlightNode(childNode, idx)
  );

  const lines = codeText.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const lineStyle: React.CSSProperties = {
    lineHeight: '22px',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, Consolas, monospace',
  };

  return (
    <div className="axiom-premium-code-block my-6 rounded-xl overflow-hidden border border-smoke/40 shadow-2xl bg-[#1e1e24] text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141416] border-b border-smoke/20 select-none">
        {/* Mock Mac Window Controls */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] block" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] block" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] block" />
        </div>

        {/* Actions (Language Badge & Copy Button) */}
        <div className="flex items-center gap-3">
          {/* Language Badge */}
          <span className="bg-[#2a2a32]/60 border border-smoke/30 rounded-md px-2.5 py-1 text-[11px] text-bone font-medium select-none uppercase tracking-wider">
            {currentLang}
          </span>

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

      {/* Code Area */}
      <div className="flex relative items-stretch min-h-[50px]">
        {/* Gutter (Line Numbers) */}
        <div 
          className="axiom-code-gutter select-none text-right pr-3.5 pl-4 py-3 text-steel/45 bg-[#17171a] border-r border-smoke/10 flex flex-col min-w-[3rem]"
          style={lineStyle}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <span key={i} className="block min-h-[22px] font-mono">
              {i + 1}
            </span>
          ))}
        </div>

        {/* Code Pre/Code Area */}
        <pre className="flex-1 overflow-x-auto p-0 m-0 py-3 px-4 bg-[#1e1e24] custom-scrollbar">
          <code className={`hljs language-${currentLang} block min-w-full text-bone`} style={lineStyle}>
            {highlightedElements}
          </code>
        </pre>
      </div>
    </div>
  );
};

const RenderPoll: React.FC<{ node: JSONContent }> = ({ node }) => {
  const { question, options, votes } = node.attrs as any;
  const totalVotes = Object.values(votes || {}).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="w-full my-6 max-w-xl mx-auto rounded-2xl border border-smoke/40 shadow-xl bg-[#1c1c1f]/80 backdrop-blur-md overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-smoke/30 bg-[#17171a]/50">
        <div className="p-2 rounded-lg bg-amber/10 text-amber">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="flex-1 text-lg font-display font-bold text-bone m-0">{question}</h3>
      </div>
      <div className="p-4 space-y-3">
        {options?.map((option: any) => {
          const voteCount = votes?.[option.id] || 0;
          const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
          return (
            <div key={option.id} className="w-full relative overflow-hidden rounded-xl border border-smoke/30 bg-black/20 p-3 min-h-[52px] flex items-center justify-between">
              <div className="absolute top-0 left-0 bottom-0 bg-amber/15 transition-all duration-700 ease-out" style={{ width: `${percentage}%` }}></div>
              <span className="relative z-10 text-sm font-medium text-bone">{option.text}</span>
              <span className="relative z-10 text-xs font-bold text-steel">{voteCount > 0 ? `${percentage}% (${voteCount})` : ''}</span>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-smoke/20 bg-[#17171a]/80 text-xs font-medium text-steel">
        {totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'} (Read-only view)
      </div>
    </div>
  );
};

const RendererContext = React.createContext<JSONContent>({});

const getJSONHeadings = (node: JSONContent): { text: string; level: number }[] => {
  const headings: { text: string; level: number }[] = [];
  const traverse = (n: JSONContent) => {
    if (n.type === 'heading') {
      const text = n.content?.map(child => child.text || '').join('') || '';
      headings.push({
        text,
        level: n.attrs?.level || 1
      });
    }
    if (n.content) {
      n.content.forEach(traverse);
    }
  };
  traverse(node);
  return headings;
};

const RenderTOC: React.FC = () => {
  const rootDoc = React.useContext(RendererContext);
  const [isOpen, setIsOpen] = useState(false);
  const headings = getJSONHeadings(rootDoc);

  const handleHeadingClick = (text: string, level: number) => {
    const domHeadings = document.querySelectorAll(`h${level}`);
    for (const domEl of Array.from(domHeadings)) {
      if (domEl.textContent?.trim() === text.trim()) {
        domEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };

  return (
    <div className="axiom-toc-block my-6 border border-smoke/30 bg-[#1c1c1f]/45 rounded-xl shadow-md overflow-hidden select-none text-left">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-charcoal/10 hover:bg-charcoal/30 text-bone transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen size={16} className="text-amber" />
          <span className="font-semibold text-sm tracking-wide font-display">Table of Contents</span>
          <span className="text-[10px] bg-charcoal border border-smoke/30 px-2 py-0.5 rounded-full text-steel font-mono">
            {headings.length} headings
          </span>
        </div>
        <div>
          {isOpen ? <ChevronDown size={16} className="text-steel" /> : <ChevronRight size={16} className="text-steel" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-smoke/10 flex flex-col gap-2 bg-[#17171a]/30 max-h-[300px] overflow-y-auto custom-scrollbar">
          {headings.length === 0 ? (
            <div className="text-xs text-steel py-2 italic text-center">
              No headings found. Add headings (H1, H2, H3) to see them here!
            </div>
          ) : (
            headings.map((heading, idx) => {
              const indentClass = heading.level === 2 
                ? 'ml-4' 
                : heading.level === 3 
                  ? 'ml-8' 
                  : 'ml-0';
              
              const textClass = heading.level === 1
                ? 'text-bone font-semibold text-xs'
                : heading.level === 2
                  ? 'text-steel font-medium text-[11px]'
                  : 'text-steel/70 text-[10.5px]';

              return (
                <button
                  key={idx}
                  onClick={() => handleHeadingClick(heading.text, heading.level)}
                  className={`text-left hover:text-amber py-1 px-2 rounded hover:bg-charcoal/30 transition-all truncate ${indentClass} ${textClass}`}
                >
                  {heading.text || `Untitled Heading ${heading.level}`}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

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
          if (href) textElement = <a key={mark.type} href={sanitizeUrl(href)} target="_blank" rel="noopener noreferrer" className="text-amber hover:text-amber/80 transition-colors underline underline-offset-4">{textElement}</a>;
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
    case 'poll': return <RenderPoll key={key} node={node} />;
    case 'image': {
      const align = attrs.align || 'center';
      const width = attrs.width || '100%';
      let alignClass = 'items-center mx-auto';
      if (align === 'left') alignClass = 'items-start mr-auto ml-0';
      if (align === 'right') alignClass = 'items-end ml-auto mr-0';
      
      return (
        <div key={key} className={`flex flex-col my-8 w-full ${alignClass}`}>
          {attrs.caption && attrs.captionPosition === 'above' && <p className="text-steel text-xs md:text-sm italic mb-3 uppercase tracking-widest font-medium px-2">{attrs.caption}</p>}
          <img src={sanitizeUrl(attrs.src)} alt={attrs.alt || ''} title={attrs.title} style={{ width, minWidth: '150px' }} className="rounded-xl object-cover shadow-2xl border border-smoke/30 max-w-full" />
          {attrs.caption && attrs.captionPosition === 'below' && <p className="text-steel text-xs md:text-sm italic mt-3 uppercase tracking-widest font-medium px-2">{attrs.caption}</p>}
        </div>
      );
    }
    case 'youtube': return <RenderYoutube key={key} {...attrs} />;
    case 'tweet': return <RenderTweet key={key} {...attrs} />;
    case 'instagram': return <RenderInstagram key={key} {...attrs} />;
    case 'sourceLink': return <RenderSourceLink key={key} {...attrs} />;
    case 'horizontalRule': return <hr key={key} className="border-t border-smoke/30 my-8" />;
    
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
      return <RenderCodeBlock key={key} node={node} attrs={attrs} />;
      
    case 'tableOfContents':
      return <RenderTOC key={key} />;
      
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
  return (
    <RendererContext.Provider value={content}>
      <div className="prose prose-invert max-w-none text-bone font-body leading-relaxed prose-p:my-1 prose-headings:my-4">
        {renderNode(content)}
      </div>
    </RendererContext.Provider>
  );
};
 
 
  