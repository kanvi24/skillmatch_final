import React from 'react';
import { X } from 'lucide-react';

export default function FilterChips({ filters, onRemove, onClearAll, defaultFilters }) {
  const getActiveChips = () => {
    const chips = [];

    // Search query
    if (filters.search) {
      chips.push({
        id: 'search',
        label: `Search: "${filters.search}"`,
        value: filters.search,
      });
    }

    // Array fields
    const arrayFields = [
      { key: 'companies', label: 'Company' },
      { key: 'departments', label: 'Department' },
      { key: 'categories', label: 'Category' },
      { key: 'employment_types', label: 'Type' },
      { key: 'role_types', label: 'Role' },
      { key: 'experience_levels', label: 'Exp' },
      { key: 'skills', label: 'Skill' },
    ];

    arrayFields.forEach(({ key, label }) => {
      if (Array.isArray(filters[key]) && filters[key].length > 0) {
        filters[key].forEach((val) => {
          chips.push({
            id: `${key}-${val}`,
            label: `${label}: ${val}`,
            field: key,
            value: val,
          });
        });
      }
    });

    // Cascading location fields
    if (filters.country) {
      chips.push({ id: 'country', label: `Country: ${filters.country}`, field: 'country' });
    }
    if (filters.state) {
      chips.push({ id: 'state', label: `State: ${filters.state}`, field: 'state' });
    }
    if (filters.city) {
      chips.push({ id: 'city', label: `City: ${filters.city}`, field: 'city' });
    }

    // Salary range
    if (
      filters.salary_min !== null &&
      filters.salary_min !== undefined &&
      filters.salary_min !== defaultFilters.salary_min
    ) {
      chips.push({
        id: 'salary_min',
        label: `Min Salary: $${(filters.salary_min / 1000).toFixed(0)}k`,
        field: 'salary_min',
      });
    }
    if (
      filters.salary_max !== null &&
      filters.salary_max !== undefined &&
      filters.salary_max !== defaultFilters.salary_max
    ) {
      chips.push({
        id: 'salary_max',
        label: `Max Salary: $${(filters.salary_max / 1000).toFixed(0)}k`,
        field: 'salary_max',
      });
    }

    // Posted within
    if (filters.posted_within) {
      const timeLabels = { '24h': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days' };
      chips.push({
        id: 'posted_within',
        label: `Posted: ${timeLabels[filters.posted_within] || filters.posted_within}`,
        field: 'posted_within',
      });
    }

    return chips;
  };

  const chips = getActiveChips();

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-zinc-800">
      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mr-1">
        Active Filters:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 text-xs text-white"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemove(chip)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors ml-auto pl-2"
      >
        Clear All
      </button>
    </div>
  );
}
