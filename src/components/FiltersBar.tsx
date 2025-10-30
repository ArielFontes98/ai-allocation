import { X } from 'lucide-react';
import { Badge } from './Badge';

interface FiltersBarProps {
  filters: Record<string, string | number | boolean | undefined>;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
}

export function FiltersBar({ filters, onClearFilter, onClearAll }: FiltersBarProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => {
    if (value === undefined || value === '') return false;
    if (typeof value === 'number' && value === 0) return false;
    return true;
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap p-4 bg-gray-50 rounded-2xl border border-gray-200">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="info" size="sm" className="flex items-center gap-1.5">
          <span>
            {key.replace(/_/g, ' ')}: {String(value)}
          </span>
          <button
            onClick={() => onClearFilter(key)}
            className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            aria-label={`Clear ${key} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-primary hover:underline font-medium ml-2"
      >
        Clear all
      </button>
    </div>
  );
}

