import React from 'react';
import { Clock, Filter, X } from 'lucide-react';
import CheckboxFilter from './CheckboxFilter';
import SkillTagFilter from './SkillTagFilter';
import RangeSlider from './RangeSlider';
import CascadingLocation from './CascadingLocation';

export default function FilterSidebar({
  filters,
  setFilters,
  filterOptions = {},
  defaultFilters,
  onClearAll,
  isLoading,
}) {
  const updateFilterField = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // reset page to 1 on any filter change
    }));
  };

  const handleLocationChange = ({ country, state, city }) => {
    setFilters((prev) => ({
      ...prev,
      country,
      state,
      city,
      page: 1,
    }));
  };

  const handleSalaryChange = ({ min, max }) => {
    setFilters((prev) => ({
      ...prev,
      salary_min: min,
      salary_max: max,
      page: 1,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-black animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
          <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>

        {/* Filter Sections scrollable container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin">
          {/* Skeleton Section 1 (Company) */}
          <div className="border-b border-zinc-800 py-4 space-y-3">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="space-y-2 px-2">
              <div className="flex items-center gap-3 py-1">
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
            </div>
          </div>

          {/* Skeleton Section 2 (Department) */}
          <div className="border-b border-zinc-800 py-4 space-y-3">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="space-y-2 px-2">
              <div className="flex items-center gap-3 py-1">
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
            </div>
          </div>

          {/* Skeleton Section 3 (Skills) */}
          <div className="border-b border-zinc-800 py-4 space-y-3">
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>

          {/* Skeleton Section 4 (Salary) */}
          <div className="border-b border-zinc-800 py-4 space-y-3">
            <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>

          {/* Skeleton Section 5 (Location) */}
          <div className="border-b border-zinc-800 py-4 space-y-3">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="space-y-2">
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-9 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-zinc-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Filter className="h-4 w-4 text-zinc-500" />
          Filter Jobs
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Filter Sections scrollable container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
        {/* Company filter */}
        <CheckboxFilter
          title="Company"
          options={filterOptions.companies || []}
          selected={filters.companies || []}
          onChange={(val) => updateFilterField('companies', val)}
        />

        {/* Department filter */}
        <CheckboxFilter
          title="Department"
          options={filterOptions.departments || []}
          selected={filters.departments || []}
          onChange={(val) => updateFilterField('departments', val)}
        />

        {/* Skills Tag input */}
        <SkillTagFilter
          selected={filters.skills || []}
          onChange={(val) => updateFilterField('skills', val)}
          allSkills={filterOptions.skills || []}
        />

        {/* Salary Range Slider */}
        <RangeSlider
          min={filterOptions.salary_range?.min || 0}
          max={filterOptions.salary_range?.max || 5000000}
          valueMin={filters.salary_min !== null ? filters.salary_min : (filterOptions.salary_range?.min || 0)}
          valueMax={filters.salary_max !== null ? filters.salary_max : (filterOptions.salary_range?.max || 5000000)}
          onChange={handleSalaryChange}
        />

        {/* Location selectors */}
        <CascadingLocation
          countries={filterOptions.countries || []}
          statesByCountry={filterOptions.states || {}}
          citiesByState={filterOptions.cities || {}}
          selectedCountry={filters.country}
          selectedState={filters.state}
          selectedCity={filters.city}
          onChange={handleLocationChange}
        />

        {/* Employment Type */}
        <CheckboxFilter
          title="Employment Type"
          options={filterOptions.employment_types || []}
          selected={filters.employment_types || []}
          onChange={(val) => updateFilterField('employment_types', val)}
        />

        {/* Role Type */}
        <CheckboxFilter
          title="Role Type"
          options={filterOptions.role_types || []}
          selected={filters.role_types || []}
          onChange={(val) => updateFilterField('role_types', val)}
        />

        {/* Experience Level */}
        <CheckboxFilter
          title="Experience Level"
          options={filterOptions.experience_levels || []}
          selected={filters.experience_levels || []}
          onChange={(val) => updateFilterField('experience_levels', val)}
        />

        {/* Category */}
        <CheckboxFilter
          title="Category"
          options={filterOptions.categories || []}
          selected={filters.categories || []}
          onChange={(val) => updateFilterField('categories', val)}
        />

        {/* Date Posted */}
        <div className="border-b border-zinc-800 py-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-3">
            <Clock className="h-4 w-4 text-zinc-400" />
            Date Posted
          </span>
          <div className="space-y-2 px-2">
            {[
              { val: '', label: 'Any time' },
              { val: '24h', label: 'Last 24 hours' },
              { val: '7d', label: 'Last 7 days' },
              { val: '30d', label: 'Last 30 days' },
            ].map((option) => (
              <label
                key={option.val}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <input
                  type="radio"
                  name="posted_within"
                  checked={filters.posted_within === option.val}
                  onChange={() => updateFilterField('posted_within', option.val)}
                  className="h-4 w-4 border-zinc-800 bg-black text-blue-500 focus:ring-0 cursor-pointer"
                />
                <span className={`text-xs ${filters.posted_within === option.val ? 'text-white font-medium' : 'text-zinc-400'} group-hover:text-zinc-200 transition-colors`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
