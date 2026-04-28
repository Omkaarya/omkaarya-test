"use client";

import Link from "next/link";
import Image from "next/image";
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
            <Image 
              src="/brand-logo/Omkaarya 9.svg" 
              alt="Omkaarya" 
              width={140} 
              height={32} 
              className="h-8 w-auto dark:invert" 
            />
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
