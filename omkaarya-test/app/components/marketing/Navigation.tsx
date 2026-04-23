"use client";

import Link from "next/link";
import { useEffect } from "react";

export function Navigation() {
  useEffect(() => {
    // Ported from script.js: Navbar scroll effect
    const nav = document.getElementById('navigation');
    const handleScroll = () => {
      if (window.scrollY > 50) {
        nav?.classList.add('scrolled');
      } else {
        nav?.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="nav" id="navigation">
      <div className="nav-outer">
        <div className="nav-pill">
          {/* Logo */}
          <Link href="#" className="nav-logo">
            <div className="nav-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 22h18L12 2z"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="22" x2="8" y2="16"/>
                <line x1="16" y1="22" x2="16" y2="16"/>
              </svg>
            </div>
            <span className="nav-logo-text">Omkaarya</span>
          </Link>
          {/* Divider */}
          <div className="nav-divider"></div>
          {/* Links */}
          <div className="nav-links">
            <a href="#hero" className="nav-link active">Home</a>
            <a href="#features-bento" className="nav-link">Features</a>
            <a href="#how-to-join" className="nav-link">How it works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>
          {/* Divider */}
          <div className="nav-divider"></div>
          {/* Actions */}
          <div className="nav-actions">
            <a href="#contact" className="nav-btn-ghost">Contact Us</a>
            <a href="#cta-final" className="nav-btn-primary">Request a Demo <span className="arrow">→</span></a>
          </div>
        </div>
      </div>
    </nav>
  );
}
