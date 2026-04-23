"use client";

import React, { useState } from "react";
import { Button } from "../../ds/atoms/Button";

interface FAQItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

const FAQItem = ({ question, answer, defaultOpen = false }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={\`flex flex-col rounded-[24px] p-2 transition-colors duration-300 \${isOpen ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-100 hover:bg-gray-200"}\`}>
      <button 
        className="flex justify-between items-center w-full text-left p-3 pl-5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{question}</span>
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
          {isOpen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-gray-500 text-sm leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export function FaqSection() {
  const leftFaqs = [
    {
      question: "What is Omkaarya?",
      answer: "Omkaarya is a comprehensive temple management platform designed to help administrators seamlessly handle donations, pooja bookings, and devotee communications all in one secure system.",
      defaultOpen: true,
    },
    {
      question: "How secure is my data?",
      answer: "We use bank-level encryption and maintain strict compliance with data protection regulations globally. Your temple's data is never shared or sold.",
    },
    {
      question: "What if my process is too detailed?",
      answer: "Our system is highly customizable. From specific pooja variations to complex accounting ledgers, you can tailor Omkaarya to match your exact workflows.",
    },
    {
      question: "Can I cancel my account at any time?",
      answer: "Yes, there are no long-term contracts. You can cancel your subscription at any time without hidden fees.",
    },
    {
      question: "Does Omkaarya support multi-level workflow?",
      answer: "Absolutely. You can set up custom approval chains for expenses, event planning, and facility bookings across different trust members.",
    },
  ];

  const rightFaqs = [
    {
      question: "Can I track time and expenses?",
      answer: "Yes, staff members and volunteers can log hours, and accountants can track all incoming and outgoing expenses directly in the platform.",
    },
    {
      question: "Can I use Omkaarya on my phone or tablet?",
      answer: "Omkaarya is fully responsive. You can manage everything from your mobile device or use our dedicated kiosk mode for in-temple bookings.",
    },
    {
      question: "Can I try Omkaarya before buying a plan?",
      answer: "Yes, we offer a 14-day free trial on all plans. You can test the platform with your team before making any commitments.",
    },
    {
      question: "Is there a free tier?",
      answer: "Yes, the Prarambha plan provides basic functionality completely free for smaller temples with limited needs.",
    },
    {
      question: "Is there a limit on file uploads?",
      answer: "Yes, we offer different storage limits depending on your plan. The Free plan includes 5GB, while the Pro and Business plans offer 20GB and up.",
      defaultOpen: true,
    },
  ];

  return (
    <div className="w-full max-w-6xl mb-24 px-4 sm:px-0 border-t border-gray-200 pt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <span className="text-gray-500 font-semibold text-sm uppercase tracking-wider mb-2 block">FAQs</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Questions, Answered</h2>
          <p className="text-gray-500 text-sm">Find out more about our plans and features below. Contact us for any other inquiries.</p>
        </div>
        <Button variant="outline" className="bg-white border-gray-200 rounded-full text-sm font-semibold h-10 px-6 shrink-0">
          View all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col gap-4">
          {leftFaqs.map((faq, i) => (
            <FAQItem key={i} {...faq} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {rightFaqs.map((faq, i) => (
            <FAQItem key={i} {...faq} />
          ))}
        </div>
      </div>
    </div>
  );
}
