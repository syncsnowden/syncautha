"use client";
import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "Why choose SyncAuth over another provider?",
    a: "SyncAuth is engineered specifically for script developers who demand more than basic key verification. You get 24/7 automated protection, anti-tamper security, real-time telemetry, affordable and free plans, and robust obfuscation built natively into your workflow.",
  },
  {
    q: "Will my script get cracked or decompiled?",
    a: "SyncAuth maintains a zero security flaw track record with no successful decompilations or security breaches. Our multi-layered virtualized protection and server-side validation guarantee a safe, reliable, and uncompromised experience.",
  },
  {
    q: "Does SyncAuth store my source code?",
    a: "No. SyncAuth does not store your raw source code. When you upload a script, it is obfuscated in volatile memory and purged from our database immediately following processing.",
  },
  {
    q: "How does HWID binding work?",
    a: "SyncAuth generates a non-sensitive cryptographic hardware hash when a user authenticates. This locks the key strictly to their unique device, preventing unauthorized key sharing or leaking.",
  },
  {
    q: "Can I integrate SyncAuth with my Discord bot?",
    a: "Yes! SyncAuth offers robust API endpoints and webhook log delivery so you can automate whitelist roles, send real-time execution logs, and issue license keys directly through your Discord server.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section style={{ width: "100%", maxWidth: 860, margin: "60px auto 80px", padding: "0 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 100,
            background: "rgba(0, 200, 224, 0.08)",
            border: "1px solid rgba(0, 200, 224, 0.2)",
            fontSize: 12,
            fontWeight: 600,
            color: "#00c8e0",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          <i className="fa-solid fa-circle-question" style={{ fontSize: 11 }} />
          Frequently Asked Questions
        </div>
        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          Everything you need to know about SyncAuth
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 14.5 }}>
          Have more questions? Join our Discord server to talk with our team.
        </p>
      </div>

      {/* Accordion list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              style={{
                background: isOpen ? "rgba(14, 25, 45, 0.8)" : "rgba(13, 17, 26, 0.5)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: isOpen ? "1px solid rgba(0, 200, 224, 0.35)" : "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: 16,
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow: isOpen ? "0 8px 30px rgba(0, 200, 224, 0.1)" : "none",
              }}
            >
              {/* Question button */}
              <button
                onClick={() => toggle(idx)}
                type="button"
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#ffffff",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                <span>{faq.q}</span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isOpen ? "rgba(0, 200, 224, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isOpen ? "#00c8e0" : "rgba(255, 255, 255, 0.4)",
                    flexShrink: 0,
                    transition: "transform 0.25s ease, background 0.25s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 11 }} />
                </div>
              </button>

              {/* Answer content */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 24px 22px 24px",
                    color: "rgba(255, 255, 255, 0.65)",
                    fontSize: 14,
                    lineHeight: 1.7,
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    paddingTop: 16,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
