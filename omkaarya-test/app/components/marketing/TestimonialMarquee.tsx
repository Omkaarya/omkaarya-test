"use client";

import { useEffect, useRef } from "react";

export function TestimonialMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clone original items to ensure smooth infinite scrolling
    if (trackRef.current) {
      const track = trackRef.current;
      const cards = Array.from(track.children);
      
      // Only clone once to prevent infinite mounting bugs if StrictMode runs twice
      if (cards.length <= 8) {
        cards.forEach(card => {
          const clone = card.cloneNode(true);
          track.appendChild(clone);
        });
      }
    }
  }, []);

  return (
    <div className="testimonial-track" id="testimonial-track" ref={trackRef}>
      {/* Card 1 */}
      <div className="testimonial-card">
        <div className="tc-curl"></div>
        <div className="tc-quote">❝</div>
        <p className="tc-text">We were doing Gift Aid manually on spreadsheets for 200+ donors every year. Omkaarya automated it completely. Our treasurer saves 3 full days per year — and the receipts look professional.</p>
        <div className="tc-stars">★★★★★</div>
        <div className="tc-author">
          <div><div className="tc-name">Ramesh Kumar</div><div className="tc-role">Temple Secretary · Shiva Mandir London 🇬🇧</div></div>
          <div className="tc-avatar">RK</div>
        </div>
      </div>
      {/* Card 2 */}
      <div className="testimonial-card">
        <div className="tc-curl"></div>
        <div className="tc-quote">❝</div>
        <p className="tc-text">The pooja booking system changed everything. Devotees book from their phones, we get instant notifications. No more 6am phone calls. We set it up in one afternoon.</p>
        <div className="tc-stars">★★★★★</div>
        <div className="tc-author">
          <div><div className="tc-name">Priya Nair</div><div className="tc-role">Temple Administrator · Ganesh Temple Sydney 🇦🇺</div></div>
          <div className="tc-avatar">PN</div>
        </div>
      </div>
      {/* Card 3 */}
      <div className="testimonial-card">
        <div className="tc-curl"></div>
        <div className="tc-quote">❝</div>
        <p className="tc-text">We needed IPC-compliant receipts and Omkaarya was the only platform that had this built in. Verified in 3 business days, receipts active immediately after.</p>
        <div className="tc-stars">★★★★★</div>
        <div className="tc-author">
          <div><div className="tc-name">Suresh Pillai</div><div className="tc-role">Trustee · Murugan Kovil Singapore 🇸🇬</div></div>
          <div className="tc-avatar">SP</div>
        </div>
      </div>
      {/* Card 4 */}
      <div className="testimonial-card">
        <div className="tc-curl"></div>
        <div className="tc-quote">❝</div>
        <p className="tc-text">Our devotee records were scattered across 3 different Excel files. Now everything is in one place — searchable, exportable and always up to date.</p>
        <div className="tc-stars">★★★★★</div>
        <div className="tc-author">
          <div><div className="tc-name">Lakshmi Reddy</div><div className="tc-role">Temple Manager · Sri Venkateswara Birmingham 🇬🇧</div></div>
          <div className="tc-avatar">LR</div>
        </div>
      </div>
      {/* Card 5 */}
      <div className="testimonial-card">
        <div className="tc-curl"></div>
        <div className="tc-quote">❝</div>
        <p className="tc-text">The Panchangam display on our microsite has been loved by our Tamil community. Devotees check auspicious dates directly from our temple website now.</p>
        <div className="tc-stars">★★★★★</div>
        <div className="tc-author">
          <div><div className="tc-name">Vijay Sharma</div><div className="tc-role">Head Trustee · Durga Mandir Toronto 🇨🇦</div></div>
          <div className="tc-avatar">VS</div>
        </div>
      </div>
      {/* Card 6 */}
      <div className="testimonial-card">
        <div className="tc-curl"></div>
        <div className="tc-quote">❝</div>
        <p className="tc-text">Setting up our temple subdomain took less than 10 minutes. Our community now books poojas and donates online. Completely transformed how we operate.</p>
        <div className="tc-stars">★★★★★</div>
        <div className="tc-author">
          <div><div className="tc-name">Anita Patel</div><div className="tc-role">Temple Secretary · Hanuman Temple Chicago 🇺🇸</div></div>
          <div className="tc-avatar">AP</div>
        </div>
      </div>
    </div>
  );
}
