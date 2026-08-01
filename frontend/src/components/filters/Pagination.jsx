import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, totalPages = 1, totalResults = 0, limit = 20, onPageChange }) {
  if (totalPages <= 1) {
    if (totalResults === 0) return null;
    return (
      <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 py-6 mt-6">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span> job{totalResults !== 1 && 's'}
        </p>
      </div>
    );
  }

  const startResult = (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, totalResults);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      // Calculate middle page range
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust boundaries to show 3 pages in middle
      if (page === 1 || page === 2) {
        end = 4;
      }
      if (page === totalPages || page === totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 py-6 mt-6">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing <span className="font-semibold text-gray-900 dark:text-white">{startResult}</span> to{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{endResult}</span> of{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{totalResults}</span> jobs
      </p>

      <nav className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => page > 1 && onPageChange(page - 1)}
          disabled={page === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Buttons */}
        {getPageNumbers().map((p, idx) => {
          if (p === 'ellipsis-start' || p === 'ellipsis-end') {
            return (
              <span
                key={`${p}-${idx}`}
                className="inline-flex h-8 w-8 items-center justify-center text-xs text-zinc-400 dark:text-zinc-600"
              >
                ...
              </span>
            );
          }

          const isCurrent = p === page;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded text-xs transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-blue-800 !text-white !dark:bg-white dark:text-black font-bold'
                  : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-zinc-150 dark:hover:bg-zinc-800'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => page < totalPages && onPageChange(page + 1)}
          disabled={page === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-35 disabled:cursor-not-allowed hover:bg-zinc-150 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
