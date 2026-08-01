import React from 'react';
import { IndianRupee } from 'lucide-react';

export default function RangeSlider({ min = 0, max = 5000000, valueMin, valueMax, onChange }) {
  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), valueMax - 1000);
    onChange({ min: val, max: valueMax });
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), valueMin + 1000);
    onChange({ min: valueMin, max: val });
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '';
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(0)}k`;
    }
    return `₹${val}`;
  };

  // Calculate percentage positions for the slider track fill
  const minPercent = ((valueMin - min) / (max - min)) * 100;
  const maxPercent = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="border-b border-zinc-800 py-4">
      <span className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-4">
        <IndianRupee className="h-4 w-4 text-zinc-400" />
        Salary Range
      </span>

      <div className="px-1">
        {/* Slider Controls */}
        <div className="relative h-1 w-full bg-zinc-800 rounded">
          <div
            className="absolute h-1 bg-white rounded"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={1000}
            value={valueMin}
            onChange={handleMinChange}
            className="absolute pointer-events-none appearance-none z-20 h-1 w-full bg-transparent outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer"
            style={{ top: '0' }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={1000}
            value={valueMax}
            onChange={handleMaxChange}
            className="absolute pointer-events-none appearance-none z-20 h-1 w-full bg-transparent outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer"
            style={{ top: '0' }}
          />
        </div>

        {/* Labels & Manual Input */}
        <div className="flex items-center justify-between mt-6 gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Min Salary</span>
            <div className="flex items-center bg-black border border-zinc-800 rounded px-2 py-1 text-xs">
              <span className="text-zinc-650 mr-1">₹</span>
              <input
                type="number"
                value={valueMin}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), valueMax - 1000);
                  onChange({ min: val, max: valueMax });
                }}
                className="bg-transparent text-white outline-none w-full text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <span className="text-zinc-600 mt-4">—</span>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Max Salary</span>
            <div className="flex items-center bg-black border border-zinc-800 rounded px-2 py-1 text-xs">
              <span className="text-zinc-650 mr-1">₹</span>
              <input
                type="number"
                value={valueMax}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), valueMin + 1000);
                  onChange({ min: valueMin, max: val });
                }}
                className="bg-transparent text-white outline-none w-full text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 text-center">
          <span className="text-[11px] font-semibold text-zinc-400">
            {formatCurrency(valueMin)} — {formatCurrency(valueMax)}
          </span>
        </div>
      </div>
    </div>
  );
}
