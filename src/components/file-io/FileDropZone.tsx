import { useRef } from 'react';
import { useFileDrop } from '../../hooks/use-file-drop';
import { useFeedStore } from '../../store/feed-store';

export function FileDropZone() {
  const loadFromXml = useFeedStore((s) => s.loadFromXml);
  const createNewFeed = useFeedStore((s) => s.createNewFeed);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileInput } =
    useFileDrop({
      onFile: (content, fileName) => loadFromXml(content, fileName),
    });

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-lg w-full">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 transition-colors cursor-pointer ${
            isDragging
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-5xl mb-4">
            {isDragging ? '\u{1F4E5}' : '\u{1F4C4}'}
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Nahrajte XML soubor
          </h2>
          <p className="text-gray-500 mb-4">
            Přetáhněte soubor sem nebo klikněte pro výběr
          </p>
          <p className="text-sm text-gray-400">Podporované formáty: .xml</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xml"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">nebo</span>
            </div>
          </div>

          <button
            onClick={createNewFeed}
            className="mt-4 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Vytvořit nový feed
          </button>
        </div>
      </div>
    </div>
  );
}
