import React from 'react';

export default function Background({ children }) {
  return (
    <div className="relative min-h-screen w-full bg-white text-gray-900 dark:bg-zinc-950 dark:text-gray-300 transition-colors duration-300 font-sans">
      {/* Background container that is fixed and covers the full screen */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Monochromatic Grid lines (Subtle linear background) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        {/* Blurred Gradient Background Circles */}
        <div className="absolute top-10 left-10 w-[450px] h-[450px] rounded-full bg-blue-500 blur-[150px] opacity-25 dark:opacity-20" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-blue-500 blur-[150px] opacity-25 dark:opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-400 blur-[150px] opacity-20 dark:opacity-15" />
      </div>

      {/* Page content container above the background */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
