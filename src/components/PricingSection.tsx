"use client";
import Link from "next/link";

export default function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Essential protection for new script developers.",
      popular: false,
      buttonText: "Get Started Free",
      buttonLink: "/register",
      features: [
        "Up to 200 active keys",
        "Up to 2 concurrent scripts",
        "1 project folder",
        "Basic webhook logging",
        "Ad system rewards",
        "Standard obfuscation",
      ],
      badge: "Starter",
      accentColor: "#818cf8",
    },
    {
      name: "Basic",
      price: "$5",
      period: "/month",
      desc: "Designed for expanding script hubs with daily users.",
      popular: true,
      buttonText: "Get Basic Plan",
      buttonLink: "/register",
      features: [
        "Up to 1,000 active keys",
        "Up to 8 concurrent scripts",
        "3 project folders",
        "Unlimited monthly obfuscations",
        "Advanced webhook logging",
        "Keyless (FFA) mode",
        "24/7 Priority Support",
        "Ad system rewards",
      ],
      badge: "Most Popular",
      accentColor: "#6366f1",
    },
    {
      name: "Pro",
      price: "$15",
      period: "/month",
      desc: "Uncapped capacity for high-volume enterprise script hubs.",
      popular: false,
      buttonText: "Get Pro Plan",
      buttonLink: "/register",
      features: [
        "Up to 10,000+ active keys",
        "Up to 18 concurrent scripts",
        "6 project folders",
        "Unlimited monthly obfuscations",
        "API ratelimit bypass",
        "Custom branding & URLs",
        "24/7 Dedicated Discord Support",
        "Everything in Basic",
      ],
      badge: "Enterprise",
      accentColor: "#c084fc",
    },
  ];

  return (
    <section style={{ width: "100%", maxWidth: 1120, margin: "90px auto 40px", padding: "0 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
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
          <i className="fa-solid fa-layer-group" style={{ fontSize: 11, color: "#818cf8" }} />
          Simple &amp; Transparent Plans
        </div>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            marginBottom: 12,
          }}
        >
          Scale your script hub effortlessly
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          No hidden fees or surprises. Choose a plan tailored to your script growth.
        </p>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              position: "relative",
              background: plan.popular
                ? "linear-gradient(180deg, #11131c 0%, #0a0b10 100%)"
                : "#0a0b0e",
              border: plan.popular
                ? "1px solid rgba(99, 102, 241, 0.4)"
                : "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: 20,
              padding: "38px 30px",
              display: "flex",
              flexDirection: "column",
              boxShadow: plan.popular
                ? "0 0 35px rgba(99, 102, 241, 0.15), 0 20px 50px rgba(0, 0, 0, 0.8)"
                : "0 10px 30px rgba(0, 0, 0, 0.5)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = plan.popular ? "rgba(99, 102, 241, 0.7)" : "rgba(255, 255, 255, 0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = plan.popular ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.07)";
            }}
          >
            {/* Badge */}
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: -13,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 14px",
                  borderRadius: 100,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {plan.badge}
              </div>
            )}

            {/* Plan Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>{plan.name}</h3>
              {!plan.popular && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 100,
                    background: "rgba(255, 255, 255, 0.05)",
                    color: plan.accentColor,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {plan.badge}
                </span>
              )}
            </div>

            <p style={{ fontSize: 13, color: "#94a3b8", minHeight: 38, marginBottom: 22, lineHeight: 1.5 }}>
              {plan.desc}
            </p>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 26 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
                {plan.price}
              </span>
              <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                {plan.period}
              </span>
            </div>

            {/* Action Button */}
            <Link
              href={plan.buttonLink}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px 20px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
                background: plan.popular
                  ? "#ffffff"
                  : "rgba(255, 255, 255, 0.05)",
                color: plan.popular ? "#08080a" : "#ffffff",
                border: plan.popular ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: plan.popular ? "0 4px 20px rgba(255, 255, 255, 0.15)" : "none",
                marginBottom: 30,
              }}
            >
              {plan.buttonText}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
            </Link>

            {/* Feature List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Feature Breakdown
              </div>
              {plan.features.map((feat) => (
                <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#cbd5e1" }}>
                  <i className="fa-solid fa-check" style={{ color: plan.accentColor, fontSize: 13, flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
