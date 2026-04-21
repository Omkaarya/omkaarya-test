"use client";
import React from "react";
import { Icon } from "@/components/atoms/Icon";
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons/duotone";
import { Button } from "@/components/atoms/Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showTextLabels?: boolean;
  showResultsCount?: boolean; // E.g. "Showing results: 10 per page" metadata block
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showTextLabels = true,
  showResultsCount = false,
  className = "",
}) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, "...", totalPages - 1, totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, 2, "...", totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, "...", currentPage, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 w-full py-4 border-t border-border ${className}`}>
      
      {showResultsCount && (
        <div className="flex items-center gap-2 text-sm text-text-secondary w-full sm:w-auto justify-center sm:justify-start">
          <span>Showing results:</span>
          <select className="border border-border rounded-md px-2 py-1 bg-surface outline-none text-text-primary text-sm font-medium">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <span>per page</span>
        </div>
      )}

      {!showResultsCount && showTextLabels && (
        <div className="hidden sm:block text-sm text-text-secondary">
          Page {currentPage} of {totalPages}
        </div>
      )}

      <div className={`flex items-center gap-2 ${!showResultsCount && !showTextLabels ? "w-full justify-center" : "w-full sm:w-auto justify-between sm:justify-end"}`}>
        <Button 
          variant="secondary" 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Icon icon={ArrowLeftIcon} size="sm" className="mr-1.5" /> Previous
        </Button>

        <div className="hidden sm:flex items-center gap-1 mx-2">
          {getPageNumbers().map((p, idx) => (
             p === "..." ? (
               <span key={`dots-${idx}`} className="px-3 py-2 text-text-tertiary">...</span>
             ) : (
               <button
                 key={p}
                 onClick={() => typeof p === "number" && onPageChange(p)}
                 className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors
                   ${p === currentPage ? "bg-subtle text-text-primary shadow-xs border border-border/50" : "text-text-secondary hover:bg-subtle/50 hover:text-text-primary"}
                 `}
               >
                 {p}
               </button>
             )
          ))}
        </div>

        <Button 
          variant="secondary" 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next <Icon icon={ArrowRightIcon} size="sm" className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
};

// ─── Carousel Indicators ──────────────────────────────────────────
export const CarouselIndicators: React.FC<{
  total: number;
  current: number;
  onChange?: (idx: number) => void;
}> = ({ total, current, onChange }) => (
  <div className="flex items-center gap-2 justify-center p-2 rounded-full bg-surface/80 backdrop-blur-md shadow-sm border border-border inline-flex">
    {Array.from({ length: total }).map((_, idx) => (
      <button
        key={idx}
        onClick={() => onChange?.(idx)}
        className={`h-2 transition-all duration-300 rounded-full ${idx === current ? "w-6 bg-brand" : "w-2 bg-text-tertiary/40 hover:bg-text-tertiary"}`}
        aria-label={`Go to slide ${idx + 1}`}
      />
    ))}
  </div>
);
