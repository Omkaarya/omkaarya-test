import React from "react";
import { Button } from "../../ds/atoms/Button";

export function PricingCTA() {
  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto pb-24">
      <div className="relative w-full rounded-[40px] bg-[#110e0c] border border-[#2a221d] overflow-hidden">
        
        {/* Abstract Background Waves Simulation */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-gradient-to-r from-brand-600/30 via-orange-500/10 to-transparent blur-3xl rounded-full mix-blend-screen" />
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-gradient-to-l from-brand-600/30 via-orange-500/10 to-transparent blur-3xl rounded-full mix-blend-screen" />
          <div className="absolute right-0 top-0 w-64 h-full bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-orange-400/20 via-transparent to-transparent opacity-50" />
          <div className="absolute left-0 top-0 w-64 h-full bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-orange-400/20 via-transparent to-transparent opacity-50" />
        </div>

        <div className="relative z-10 px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to reclaim<br className="md:hidden" /> your time?
          </h2>
          <p className="text-[#a08f84] text-lg max-w-lg mb-10">
            Join thousands of administrators who have already transformed their daily workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto rounded-full px-8 h-12 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white">
              Start Free Trial
            </Button>
            <Button variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 text-sm font-bold bg-[#1d1815] border-[#362e29] text-white hover:bg-[#2a221d]">
              Get a demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
