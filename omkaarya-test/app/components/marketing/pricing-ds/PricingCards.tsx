"use client";

import React, { useState } from "react";
import { Badge } from "../../ds/atoms/Badge";
import { Button } from "../../ds/atoms/Button";

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-success-500">
    <path fillRule="evenodd" clipRule="evenodd" d="M16.704 5.29291C16.8915 5.48043 16.9968 5.73477 16.9968 5.99991C16.9968 6.26505 16.8915 6.51938 16.704 6.70691L8.704 14.7069C8.51648 14.8944 8.26214 14.9997 7.997 14.9997C7.73186 14.9997 7.47753 14.8944 7.29 14.7069L3.29 10.7069C3.10862 10.5184 3.00843 10.2658 3.01099 10.0036C3.01356 9.74136 3.11868 9.49071 3.30373 9.30565C3.48879 9.1206 3.73943 9.01548 4.00167 9.01292C4.26391 9.01035 4.51649 9.11054 4.705 9.29191L7.997 12.5849L15.29 5.29291C15.4775 5.10542 15.7319 5.0001 15.997 5.0001C16.2621 5.0001 16.5165 5.10542 16.704 5.29291Z" fill="currentColor"/>
  </svg>
);

export function PricingCards() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toggle */}
      <div className="flex items-center gap-3 mb-10">
        <span className={\`text-sm font-medium \${!isAnnual ? "text-gray-900" : "text-gray-500"}\`}>Monthly</span>
        <button
          type="button"
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
          role="switch"
          aria-checked={isAnnual}
        >
          <span className="sr-only">Toggle billing period</span>
          <span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md bg-white"></span>
          <span aria-hidden="true" className="pointer-events-none absolute mx-auto h-4 w-9 rounded-full bg-gray-200 transition-colors duration-200 ease-in-out"></span>
          <span
            aria-hidden="true"
            className={\`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out \${isAnnual ? "translate-x-5" : "translate-x-0"}\`}
          ></span>
        </button>
        <span className={\`text-sm font-medium \${isAnnual ? "text-gray-900" : "text-gray-500"}\`}>Annually</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        
        {/* Free Plan */}
        <div className="flex flex-col p-6 sm:p-8 bg-white border border-gray-200 rounded-[24px] shadow-sm relative">
          <div className="mb-6 flex justify-between items-start">
            <Badge color="brand" size="sm" className="bg-brand-50 text-brand-700 border border-brand-200">
              <div className="w-2 h-2 rounded-full bg-brand-500 mr-1.5" />
              Free Plan
            </Badge>
          </div>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-500 font-medium">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-6 h-10">
            For individuals just getting started with admin tools.
          </p>
          <Button variant="primary" className="w-full justify-center mb-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12">
            Start free
          </Button>
          
          <ul className="flex flex-col gap-4 text-sm text-gray-700 flex-grow">
            <li className="flex items-center gap-3"><CheckIcon /> 1 seat included</li>
            <li className="flex items-center gap-3"><CheckIcon /> Basic dashboard access</li>
            <li className="flex items-center gap-3"><CheckIcon /> Up to 100 members</li>
            <li className="flex items-center gap-3"><CheckIcon /> Community support</li>
            <li className="flex items-center gap-3"><CheckIcon /> Core features</li>
            <li className="flex items-center gap-3 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-50"><path d="M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              No custom branding
            </li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="flex flex-col p-6 sm:p-8 bg-white border-2 border-brand-500 rounded-[24px] shadow-lg relative">
          <div className="mb-6 flex justify-between items-start">
            <Badge color="brand" size="sm" className="bg-brand-50 text-brand-700 border border-brand-200">
              <div className="w-2 h-2 rounded-full bg-brand-500 mr-1.5" />
              Pro Plan
            </Badge>
            <Badge color="gray" size="sm" className="bg-gray-100 text-gray-700 rounded-full font-bold">
              Save 20%
            </Badge>
          </div>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">$19</span>
            <span className="text-gray-500 font-medium">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-6 h-10">
            For teams ready to collaborate and automate.
          </p>
          <Button variant="primary" className="w-full justify-center mb-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12">
            Get started
          </Button>
          
          <ul className="flex flex-col gap-4 text-sm text-gray-700 flex-grow">
            <li className="flex items-center gap-3"><CheckIcon /> Up to 5 seats</li>
            <li className="flex items-center gap-3"><CheckIcon /> Advanced dashboard access</li>
            <li className="flex items-center gap-3"><CheckIcon /> Unlimited members</li>
            <li className="flex items-center gap-3"><CheckIcon /> Priority email support</li>
            <li className="flex items-center gap-3"><CheckIcon /> Custom domain + branding</li>
            <li className="flex items-center gap-3"><CheckIcon /> Analytics & exports</li>
          </ul>
        </div>

        {/* Business Plan */}
        <div className="flex flex-col p-6 sm:p-8 bg-white border border-gray-200 rounded-[24px] shadow-sm relative">
          <div className="mb-6 flex justify-between items-start">
            <Badge color="brand" size="sm" className="bg-brand-50 text-brand-700 border border-brand-200">
              <div className="w-2 h-2 rounded-full bg-brand-500 mr-1.5" />
              Business Plan
            </Badge>
          </div>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">$38</span>
            <span className="text-gray-500 font-medium">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-6 h-10">
            For organizations needing full power and control.
          </p>
          <Button variant="primary" className="w-full justify-center mb-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12">
            Get started now
          </Button>
          
          <ul className="flex flex-col gap-4 text-sm text-gray-700 flex-grow">
            <li className="flex items-center gap-3"><CheckIcon /> Unlimited seats</li>
            <li className="flex items-center gap-3"><CheckIcon /> API & webhooks</li>
            <li className="flex items-center gap-3"><CheckIcon /> Dedicated account manager</li>
            <li className="flex items-center gap-3"><CheckIcon /> Custom integrations (ERP/CRM)</li>
            <li className="flex items-center gap-3"><CheckIcon /> 99.9% uptime SLA</li>
            <li className="flex items-center gap-3"><CheckIcon /> SSO & auditing log</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
