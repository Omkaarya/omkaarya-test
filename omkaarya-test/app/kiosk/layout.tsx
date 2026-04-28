import React from "react";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-0 md:p-6 font-sans antialiased">
      {/* 9:16 Portrait Container with "Physical Machine" Frame */}
      <div className="relative w-full max-w-[500px] aspect-[9/16] bg-[#FDFCFB] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] md:rounded-[48px] border-[12px] border-[#222] ring-1 ring-white/10">
        
        {/* Subtle Sacred Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-50 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative h-full z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
