"use client";

import { useState } from "react";

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<string>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? "" : id);
  };

  const faqsLeft = [
    {
      id: "faq-1",
      question: "What is Omkaarya?",
      answer: "Omkaarya is a complete temple management platform built for Hindu temples worldwide. It covers devotee management, pooja booking, donations, tax-compliant receipts, Panchangam and a public microsite — all in one place. Operated by Pepulux Pvt Ltd."
    },
    {
      id: "faq-2",
      question: "How does the onboarding process work?",
      answer: "You submit a demo request on our website. Our team reviews your temple within 48 hours. Once verified, you receive an email with a calendar link to book your preferred demo time slot. After the demo, we create your account, set up your subdomain and send your invitation — you're live within 24 hours."
    },
    {
      id: "faq-3",
      question: "How secure is my temple's data?",
      answer: "Each temple's data is fully isolated in our multi-tenant system. We use HTTPS encryption for all data in transit, regular encrypted backups and strict access controls. No data is ever shared between temple accounts."
    },
    {
      id: "faq-4",
      question: "Which countries are supported for compliance receipts?",
      answer: "Currently live — United Kingdom (Gift Aid / HMRC), United States (501(c)(3) / IRS), Canada (CRA), Australia (DGR / ATO), Singapore (IPC) and Sri Lanka (Registered NPO). Germany, France, Netherlands, Norway, Denmark and Italy are on our roadmap. Contact us if your country isn't listed."
    },
    {
      id: "faq-5",
      question: "What are the available pricing plans?",
      answer: "We offer three plans — Prarambha ($20/mo), Sankalpa ($49/mo) and Aaradhana ($99/mo). All plans include a one-time setup fee. Monthly plans include a 14-day trial. Annual plans include a 30-day trial and 1 month free. Pricing is confirmed during your demo call."
    }
  ];

  const faqsRight = [
    {
      id: "faq-6",
      question: "How do compliance tax receipts work?",
      answer: "On the Sankalpa and Aaradhana plans, you submit your charity registration documents via your admin panel. Our team verifies these within 5 business days. Once verified, every donation automatically generates a fully compliant tax receipt — Gift Aid, 501(c)(3), CRA, DGR or IPC."
    },
    {
      id: "faq-7",
      question: "Can devotees from any country donate to our temple?",
      answer: "Yes. The tax receipt generated follows your temple's registered country rules — not the devotee's location. If your temple is in the UK, every donation generates a Gift Aid receipt under HMRC rules regardless of where the devotee is based."
    },
    {
      id: "faq-8",
      question: "Which Panchangam traditions are supported?",
      answer: "Omkaarya supports four regional traditions — Tamil, Telugu, Karnataka and Kerala. Each temple chooses which regional variant to display on their microsite. Panchangam data is maintained centrally by Pepulux and updated regularly."
    },
    {
      id: "faq-9",
      question: "What happens to my data if I cancel?",
      answer: "Your temple data is retained for 30 days after cancellation. During this period you can export all your records from your admin panel. After 30 days, data may be permanently deleted. We recommend exporting before cancelling."
    },
    {
      id: "faq-10",
      question: "Is there a free trial available?",
      answer: "Yes. Monthly plans include a 14-day free trial. Annual plans include a 30-day free trial. Every trial requires a demo call first — our team creates your account after the demo and your trial begins from that point. No self-signup — every temple is verified before onboarding."
    }
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        <div className="faq-header">
          <div className="faq-header-left">
            <span className="pill-tag">✦ FAQ's</span>
            <h2 className="section-h2 left">Your Questions, Answered</h2>
            <p className="section-sub left">Find answers to commonly asked questions about Omkaarya, covering features, onboarding, compliance and pricing.</p>
          </div>
          <a href="#contact" className="btn-outline-pill faq-contact">Contact Us ›</a>
        </div>

        <div className="faq-grid">
          {/* Left column */}
          <div className="faq-col">
            {faqsLeft.map((faq) => (
              <div key={faq.id} className={`faq-item ${openFaq === faq.id ? "open" : ""}`} id={faq.id}>
                <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                  <span>{faq.question}</span>
                  <span className="faq-toggle">{openFaq === faq.id ? "×" : "+"}</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="faq-col">
            {faqsRight.map((faq) => (
              <div key={faq.id} className={`faq-item ${openFaq === faq.id ? "open" : ""}`} id={faq.id}>
                <button className="faq-question" onClick={() => toggleFaq(faq.id)}>
                  <span>{faq.question}</span>
                  <span className="faq-toggle">{openFaq === faq.id ? "×" : "+"}</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
