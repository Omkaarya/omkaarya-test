import React from "react";
import { Badge } from "../../ds/atoms/Badge";

export function PricingHeader() {
  return (
    <div className="flex flex-col items-center text-center mt-12 mb-10 w-full">
      <Badge color="gray" size="sm" className="mb-6 font-semibold uppercase tracking-wider text-gray-600 bg-white border border-gray-200">
        <span className="mr-1 text-brand-500">✦</span> Pricing
      </Badge>
      
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
        Flexible plans that grow with you
      </h1>
      
      <p className="text-lg text-gray-500 max-w-2xl">
        Simple pricing built for every scale.
      </p>
    </div>
  );
}
