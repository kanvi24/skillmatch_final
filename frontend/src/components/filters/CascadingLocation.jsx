import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function CascadingLocation({
  countries = [],
  statesByCountry = {},
  citiesByState = {},
  selectedCountry,
  selectedState,
  selectedCity,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Reset dependent fields if parent changes
  const handleCountryChange = (e) => {
    const country = e.target.value;
    onChange({ country, state: '', city: '' });
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    onChange({ country: selectedCountry, state, city: '' });
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    onChange({ country: selectedCountry, state: selectedState, city });
  };

  const states = selectedCountry ? statesByCountry[selectedCountry] || [] : [];
  const cities = selectedState ? citiesByState[selectedState] || [] : [];

  return (
    <div className="border-b border-zinc-800 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-zinc-200 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-zinc-400" />
          Location
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {/* Country Selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Country</span>
            <select
              value={selectedCountry || ''}
              onChange={handleCountryChange}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-700 transition-colors cursor-pointer"
            >
              <option value="">Any Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* State Selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">State / Province</span>
            <select
              value={selectedState || ''}
              onChange={handleStateChange}
              disabled={!selectedCountry || states.length === 0}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <option value="">Any State</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">City</span>
            <select
              value={selectedCity || ''}
              onChange={handleCityChange}
              disabled={!selectedState || cities.length === 0}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <option value="">Any City</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
