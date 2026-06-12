import React, { useCallback } from 'react';
import { useAxiomEditor } from '../core/AxiomEditorContext';

export const MediaMenu: React.FC = () => {
  const { editor, mediaModalOpen, setMediaModalOpen, mediaModalType, mediaModalInput, setMediaModalInput } = useAxiomEditor();

  const handleMediaModalSubmit = useCallback(() => {
    const inputVal = mediaModalInput.trim();
    if (!inputVal || !editor) {
      setMediaModalOpen(false);
      return;
    }

    if (mediaModalType === 'link') {
      let linkUrl = inputVal;
      if (!/^https?:\/\//i.test(linkUrl) && !/^mailto:/i.test(linkUrl) && !/^tel:/i.test(linkUrl)) {
        linkUrl = 'https://' + linkUrl;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else if (mediaModalType === 'video') {
      editor.chain().focus().setYoutubeVideo({ src: inputVal }).run();
    } else if (mediaModalType === 'tweet') {
      editor.chain().focus().insertContent({ type: 'tweet', attrs: { url: inputVal } }).run();
    } else if (mediaModalType === 'instagram') {
      editor.chain().focus().insertContent({ type: 'instagram', attrs: { url: inputVal } }).run();
    }

    setMediaModalOpen(false);
    setMediaModalInput('');
  }, [mediaModalInput, mediaModalType, editor, setMediaModalOpen, setMediaModalInput]);

  if (!mediaModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-obsidian border border-smoke/60 p-5 md:p-6 rounded-2xl w-full max-w-md shadow-2xl mx-4 sm:mx-0">
        <h3 className="text-bone font-display font-semibold mb-4">
          {mediaModalType === 'link' && "Insert Hyperlink"}
          {mediaModalType === 'video' && "Insert YouTube Embed"}
          {mediaModalType === 'tweet' && "Insert X / Twitter Embed"}
          {mediaModalType === 'instagram' && "Insert Instagram Embed"}
        </h3>
        <input
          type="text"
          value={mediaModalInput}
          onChange={e => setMediaModalInput(e.target.value)}
          placeholder={
            mediaModalType === 'link' ? "https://example.com" :
              mediaModalType === 'video' ? "https://youtube.com/watch?v=..." :
                mediaModalType === 'tweet' ? "https://x.com/username/status/..." :
                  "https://instagram.com/reel/..."
          }
          className="w-full bg-charcoal/30 border border-smoke/60 rounded-xl px-4 py-3 text-bone focus:outline-none focus:border-amber mb-6 transition-colors text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleMediaModalSubmit();
            } else if (e.key === 'Escape') {
              setMediaModalOpen(false);
            }
          }}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setMediaModalOpen(false)}
            className="px-5 py-2.5 text-steel hover:text-bone text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMediaModalSubmit}
            className="px-5 py-2.5 bg-amber hover:bg-amber/90 text-obsidian font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(255,191,0,0.15)]"
          >
            {mediaModalType === 'link' && "Insert Link"}
            {mediaModalType === 'video' && "Insert Video"}
            {mediaModalType === 'tweet' && "Insert Tweet"}
            {mediaModalType === 'instagram' && "Insert Instagram"}
          </button>
        </div>
      </div>
    </div>
  );
};
 
 
 