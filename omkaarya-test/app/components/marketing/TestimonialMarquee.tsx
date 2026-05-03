"use client";

import { useEffect, useRef } from "react";

export type MarketingTestimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  templeName: string;
  countryFlag: string;
  rating: number;
};

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1]![0] : "";
  return `${a}${b}`.toUpperCase();
}

function stars(rating: number): string {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
}

export function TestimonialMarquee({ items }: { items: MarketingTestimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clone original items to ensure smooth infinite scrolling
    if (trackRef.current) {
      const track = trackRef.current;
      const cards = Array.from(track.children);
      
      // Only clone once to prevent infinite mounting bugs if StrictMode runs twice
      if (cards.length > 0 && cards.length <= 8) {
        cards.forEach(card => {
          const clone = card.cloneNode(true);
          track.appendChild(clone);
        });
      }
    }
  }, []);

  return (
    <div className="testimonial-track" id="testimonial-track" ref={trackRef}>
      {items.map((t) => (
        <div key={t.id} className="testimonial-card">
          <div className="tc-curl"></div>
          <div className="tc-quote">❝</div>
          <p className="tc-text">{t.quote}</p>
          <div className="tc-stars">{stars(t.rating)}</div>
          <div className="tc-author">
            <div>
              <div className="tc-name">{t.authorName}</div>
              <div className="tc-role">
                {t.authorRole} · {t.templeName} {t.countryFlag}
              </div>
            </div>
            <div className="tc-avatar">{initials(t.authorName)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
