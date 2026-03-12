interface ImageUrlEditorProps {
  imgUrl: string;
  imgUrlAlternative: string[];
  onImgUrlChange: (url: string) => void;
  onAlternativesChange: (urls: string[]) => void;
}

export function ImageUrlEditor({
  imgUrl,
  imgUrlAlternative,
  onImgUrlChange,
  onAlternativesChange,
}: ImageUrlEditorProps) {
  const addAlternative = () => {
    onAlternativesChange([...imgUrlAlternative, '']);
  };

  const updateAlternative = (index: number, value: string) => {
    const updated = imgUrlAlternative.map((url, i) => (i === index ? value : url));
    onAlternativesChange(updated);
  };

  const removeAlternative = (index: number) => {
    onAlternativesChange(imgUrlAlternative.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          IMGURL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={imgUrl}
          onChange={(e) => onImgUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Alternativní obrázky
          </label>
          <button
            type="button"
            onClick={addAlternative}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            + Přidat
          </button>
        </div>
        {imgUrlAlternative.map((url, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateAlternative(i, e.target.value)}
              placeholder="https://example.com/image-alt.jpg"
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => removeAlternative(i)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
