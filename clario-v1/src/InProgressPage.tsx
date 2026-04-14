import React from "react";

const ClarioInProgress: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 font-sans text-gray-200">
      
      {/* Container */}
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-8">

        {/* Animated Logo/Brand Section */}
        <div className="relative">
          {/* Glowing background effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-25 animate-pulse"></div>
          <h1 className="relative text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 py-2">
            Clario.
          </h1>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-sm font-medium text-gray-300">
          <span className="relative flex w-2 h-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System in development
        </div>

        {/* Main Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            Something amazing is coming.
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm md:text-base">
            We are currently building the foundation for Clario. The architecture is taking shape, and we can't wait to share it with you.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="w-full pt-4">
          <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 w-2/3 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right uppercase tracking-wider font-semibold">
            Progress: ~65%
          </p>
        </div>

        {/* Simple Email Notify Mockup */}
        <div className="w-full pt-6">
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email for updates"
              required
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Notify Me
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-3">
            No spam. We'll only email you when we go live.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ClarioInProgress;