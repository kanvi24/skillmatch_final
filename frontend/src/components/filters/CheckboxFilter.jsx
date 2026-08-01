import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CheckboxFilter({ title, options = [], selected = [], onChange, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const handleCheckboxChange = (option) => {
    const isSelected = selected.includes(option);
    const newSelected = isSelected
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const visibleOptions = showAll ? options : options.slice(0, 5);
  const hasMore = options.length > 5;

  return (
    <div className="border-b border-zinc-800 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-zinc-400" />}
          {title}
          {selected.length > 0 && (
            <span className="inline-flex h-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-black min-w-5">
              {selected.length}
            </span>
          )}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {options.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No options available</p>
          ) : (
            <>
              {visibleOptions.map((option) => {
                const isChecked = selected.includes(option);
                return (
                  <label
                    key={option}
                    className="flex items-start gap-3 rounded-md py-1.5 px-2 cursor-pointer select-none group"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(option)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-800 bg-black text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className={`text-xs ${isChecked ? 'text-white font-medium' : 'text-zinc-400'} group-hover:text-zinc-200 transition-colors`}>
                      {option}
                    </span>
                  </label>
                );
              })}

              {hasMore && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-1 px-2 pt-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showAll ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Show {options.length - 5} more</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
