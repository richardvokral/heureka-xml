import { useFeedStore } from '../../store/feed-store';

export function ValidationSummary() {
  const errors = useFeedStore((s) => s.validationErrors);

  const errorsByType = new Map<string, number>();
  const warningsByType = new Map<string, number>();

  for (const err of errors) {
    const map = err.severity === 'error' ? errorsByType : warningsByType;
    map.set(err.message, (map.get(err.message) ?? 0) + 1);
  }

  if (errorsByType.size === 0 && warningsByType.size === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-medium">Feed je validní — žádné chyby.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorsByType.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">
            Chyby ({errors.filter((e) => e.severity === 'error').length})
          </h3>
          <ul className="space-y-1">
            {[...errorsByType.entries()].map(([msg, count]) => (
              <li key={msg} className="text-sm text-red-700">
                <span className="font-medium">{count}x</span> {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warningsByType.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">
            Upozornění ({errors.filter((e) => e.severity === 'warning').length})
          </h3>
          <ul className="space-y-1">
            {[...warningsByType.entries()].map(([msg, count]) => (
              <li key={msg} className="text-sm text-yellow-700">
                <span className="font-medium">{count}x</span> {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
