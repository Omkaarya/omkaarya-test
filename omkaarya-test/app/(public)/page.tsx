import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CMS_DB } from "@/lib/mock-cms";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await CMS_DB.getPageBySlug("/");
  return {
    title: pageData?.title || "Omkaarya",
    description: pageData?.metaDescription || "Temple Management Workflow",
  };
}

export default async function HomePage() {
  const pageData = await CMS_DB.getPageBySlug("/");
  const content = pageData?.content;

  if (!content) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      
      {/* ── Hero Section ── */}
      <section className="relative w-full max-w-6xl mx-auto px-6 pt-20 pb-32 text-center flex flex-col items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-brand-50/50 to-transparent blur-3xl -z-10 rounded-full" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            {content.hero.headline}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Temple operations unified, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400">
            like never before.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {content.hero.subheadline}
        </p>
        
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link href={content.hero.ctaPrimaryLink} className="bg-brand-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-600 transition-colors flex items-center gap-2 shadow-lg shadow-brand-500/25">
            {content.hero.ctaPrimaryText} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href={content.hero.ctaSecondaryLink} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {content.hero.ctaSecondaryText}
          </Link>
        </div>

        {/* Dashboard Mockup Image */}
        <div className="mt-20 relative w-full max-w-5xl mx-auto rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black aspect-[16/9] flex items-center justify-center relative">
             <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-400">
                <span className="text-4xl mb-4">🛕</span>
                <p className="font-medium">Omkaarya Dashboard Mockup</p>
             </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid (Replacing the Ametrix generic one) ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Everything you need to manage your temple
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            From pooja bookings to complex inventory, it's all here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.features.map((feature: any, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials (What Our Users Say) ── */}
      <section className="w-full bg-gray-50 dark:bg-black py-24 border-y border-gray-100 dark:border-gray-900 overflow-hidden">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            What Our Users Say
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full max-w-7xl mx-auto flex gap-6 overflow-hidden pb-8 px-6">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-black to-transparent z-10 pointer-events-none" />
          
          {/* Dummy Testimonials */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-[350px] bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative">
              <div className="text-brand-500 text-4xl font-serif absolute top-6 right-8 opacity-20">"</div>
              <div className="flex text-brand-500 mb-4 gap-1">
                {[1,2,3,4,5].map(star => <span key={star} className="text-sm">★</span>)}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-4 relative z-10">
                "Omkaarya has completely transformed how we handle our daily pooja bookings and donations. Our devotees love the new digital experience, and our accountants save hours every week!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Temple Admin {i}</h4>
                  <p className="text-xs text-gray-500">Shiva Temple, London</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
          <div className="pt-8 md:pt-0">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">5K+</p>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Active Temples</p>
          </div>
          <div className="pt-8 md:pt-0">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">10M+</p>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Poojas Booked</p>
          </div>
          <div className="pt-8 md:pt-0">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">558+</p>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Staff Members</p>
          </div>
        </div>
      </section>

      {/* ── Ready to Reclaim CTA (Black Curved Container) ── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="relative w-full rounded-[40px] bg-gray-900 dark:bg-black overflow-hidden border border-gray-800">
          {/* Abstract background waves/glow mimicking Ametrix */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 px-8 py-20 md:py-28 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 max-w-2xl">
              Ready to reclaim your time?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl">
              Join thousands of temple administrators who have already transformed their daily workflow.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/register" className="bg-brand-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/25">
                Start Free Trial
              </Link>
              <Link href="/contact" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm">
                Get a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
