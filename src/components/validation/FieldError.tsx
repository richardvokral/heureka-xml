import { useFeedStore } from '../../store/feed-store';
import { getFieldErrors } from '../../lib/validator';

interface FieldErrorProps {
  itemId: string;
  field: string;
}

export function FieldError({ itemId, field }: FieldErrorProps) {
  const errors = useFeedStore((s) => s.validationErrors);
  const fieldErrors = getFieldErrors(errors, itemId, field);

  if (fieldErrors.length === 0) return null;

  return (
    <div className="mt-1">
      {fieldErrors.map((err, i) => (
        <p
          key={i}
          className={`text-xs ${
            err.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}
        >
          {err.message}
        </p>
      ))}
    </div>
  );
}
