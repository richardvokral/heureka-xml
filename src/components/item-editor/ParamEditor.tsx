import type { Param } from '../../types/heureka';

interface ParamEditorProps {
  params: Param[];
  onChange: (params: Param[]) => void;
}

export function ParamEditor({ params, onChange }: ParamEditorProps) {
  const updateParam = (index: number, field: keyof Param, value: string) => {
    const updated = params.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange(updated);
  };

  const addParam = () => {
    onChange([...params, { paramName: '', val: '' }]);
  };

  const removeParam = (index: number) => {
    onChange(params.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Parametry</label>
        <button
          type="button"
          onClick={addParam}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          + Přidat parametr
        </button>
      </div>
      {params.length === 0 && (
        <p className="text-sm text-gray-400">Žádné parametry</p>
      )}
      {params.map((param, i) => (
        <div key={i} className="flex flex-wrap gap-2 items-start">
          <input
            type="text"
            value={param.paramName}
            onChange={(e) => updateParam(i, 'paramName', e.target.value)}
            placeholder="Název parametru"
            className="flex-1 min-w-[120px] px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <input
            type="text"
            value={param.val}
            onChange={(e) => updateParam(i, 'val', e.target.value)}
            placeholder="Hodnota"
            className="flex-1 min-w-[120px] px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => removeParam(i)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Odebrat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
