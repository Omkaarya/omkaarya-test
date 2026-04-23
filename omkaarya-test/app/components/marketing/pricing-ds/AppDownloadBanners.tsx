import React from "react";
import { Button } from "../../ds/atoms/Button";

export function AppDownloadBanners() {
  return (
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
      
      {/* Desktop Download Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-gray-900 border border-gray-800 p-8 md:p-10 flex flex-col min-h-[400px]">
        {/* Glow effect */}
        <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] bg-brand-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[300px] h-[300px] bg-amber-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />

        <div className="flex justify-between items-start z-10 mb-12">
          <div>
            <p className="text-gray-400 text-sm mb-1 font-medium">Be Faster!</p>
            <h3 className="text-white text-3xl font-bold">Download for<br/>Desktop</h3>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full backdrop-blur-md">
              Download 🍏
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full backdrop-blur-md">
              Download 🪟
            </Button>
          </div>
        </div>

        {/* Abstract Mockup Area */}
        <div className="relative flex-grow mt-auto z-10 rounded-t-2xl border-t border-l border-r border-white/10 bg-gradient-to-b from-white/10 to-transparent p-4 mx-4 shadow-2xl overflow-hidden">
           <div className="w-full h-full bg-gray-100/10 rounded-xl border border-white/5 backdrop-blur-sm relative overflow-hidden flex flex-col">
              <div className="h-6 border-b border-white/10 flex items-center px-3 gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400/50" />
                <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                <div className="w-2 h-2 rounded-full bg-green-400/50" />
              </div>
              <div className="flex-grow p-4 opacity-50">
                <div className="w-1/3 h-4 bg-white/20 rounded mb-4" />
                <div className="flex gap-4">
                  <div className="w-1/4 h-24 bg-white/10 rounded-lg" />
                  <div className="w-3/4 h-24 bg-white/10 rounded-lg" />
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Mobile Download Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#423126] border border-[#523d2f] p-8 md:p-10 flex flex-col min-h-[400px]">
        {/* Glow effect */}
        <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] bg-brand-500 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-[300px] h-[300px] bg-yellow-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />

        <div className="flex justify-between items-start z-10 mb-12">
          <div>
            <p className="text-[#d1b09b] text-sm mb-1 font-medium">On the go!</p>
            <h3 className="text-white text-3xl font-bold">Download for<br/>Mobile</h3>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full backdrop-blur-md">
              Download 🍏
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full backdrop-blur-md">
              Download 🤖
            </Button>
          </div>
        </div>

        {/* Abstract Mobile Mockups Area */}
        <div className="relative flex-grow mt-auto z-10 flex justify-center items-end gap-4 px-4 overflow-hidden h-[180px]">
           <div className="w-24 h-[160px] bg-white rounded-t-3xl border-4 border-gray-900 shadow-2xl relative translate-y-4 opacity-80" />
           <div className="w-32 h-[200px] bg-white rounded-t-3xl border-4 border-gray-900 shadow-2xl relative z-10" />
           <div className="w-24 h-[160px] bg-white rounded-t-3xl border-4 border-gray-900 shadow-2xl relative translate-y-4 opacity-80" />
        </div>
      </div>

    </div>
  );
}
