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
    <section style={{ width: "100%", maxWidth: 860, margin: "60px auto 90px", padding: "0 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 16px",
            borderRadius: 100,
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: 12,
            fontWeight: 600,
            color: "#cbd5e1",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          <i className="fa-solid fa-circle-question" style={{ fontSize: 11, color: "#818cf8" }} />
          Got Questions?
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            marginBottom: 12,
          }}
        >
          Frequently Asked Questions
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14.5 }}>
          Everything you need to know about our security, infrastructure, and plans.
        </p>
      </div>

      {/* Accordion List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              style={{
                background: isOpen ? "#0f1118" : "#08090d",
                border: isOpen ? "1px solid rgba(99, 102, 241, 0.35)" : "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: 16,
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow: isOpen ? "0 8px 30px rgba(0, 0, 0, 0.6)" : "none",
              }}
            >
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
                  color: isOpen ? "#ffffff" : "#cbd5e1",
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
                    background: isOpen ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isOpen ? "#818cf8" : "#64748b",
                    flexShrink: 0,
                    transition: "transform 0.25s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 11 }} />
                </div>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 24px 22px 24px",
                    color: "#94a3b8",
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
