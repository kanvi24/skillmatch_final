import React, { useState, useRef, useEffect } from 'react';
import { Tag, X, Plus, ChevronDown } from 'lucide-react';

export default function SkillTagFilter({ selected = [], onChange, allSkills = [] }) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions(allSkills.slice(0, 10));
    } else {
      const filtered = allSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(input.toLowerCase()) &&
          !selected.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10));
    }
  }, [input, allSkills, selected]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill) => {
    if (skill && !selected.includes(skill)) {
      onChange([...selected, skill]);
    }
    setInput('');
    setIsOpen(false);
  };

  const removeSkill = (skill) => {
    onChange(selected.filter((s) => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If there's a matching suggestion, use that, else use the raw input (if not empty)
      const exactMatch = allSkills.find(
        (s) => s.toLowerCase() === input.trim().toLowerCase()
      );
      if (exactMatch) {
        addSkill(exactMatch);
      } else if (input.trim()) {
        addSkill(input.trim());
      }
    }
  };

  return (
    <div className="border-b border-zinc-800 py-4" ref={containerRef}>
      <span className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
        <Tag className="h-4 w-4 text-zinc-400" />
        Skills
      </span>

      <div className={`relative mt-3 ${isOpen ? 'z-30' : 'z-0'}`}>
        <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 p-1.5 focus-within:border-zinc-700 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill..."
            className="flex-1 bg-transparent px-1 text-xs text-white placeholder-zinc-500 outline-none"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => addSkill(input.trim())}
              className="rounded bg-zinc-800 p-1 hover:bg-zinc-700 transition-colors mr-1"
            >
              <Plus className="h-3 w-3 text-zinc-300" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-0.5 hover:text-zinc-300 text-zinc-500 transition-colors cursor-pointer mr-0.5"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-zinc-800 bg-black py-1 shadow-lg scrollbar-thin">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSkill(suggestion)}
                className="flex w-full items-center px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selected.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
