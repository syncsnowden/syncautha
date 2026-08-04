"use client";
import Link from "next/link";

export default function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Ideal for new developers or small private scripts.",
      popular: false,
      buttonText: "Get Started Free",
      buttonLink: "/register",
      features: [
        "Up to 200 keys at once",
        "Up to 2 scripts at once",
        "1 project folder",
        "Basic webhook logs",
        "Ad system (rewards)",
        "Standard obfuscation",
      ],
      badge: "Free Tier",
      badgeColor: "rgba(255, 255, 255, 0.1)",
      accentColor: "#00c8e0",
    },
    {
      name: "Basic",
      price: "$5",
      period: "/month",
      desc: "Best plan for growing script hubs with active users.",
      popular: true,
      buttonText: "Upgrade to Basic",
      buttonLink: "/register",
      features: [
        "Up to 1,000 keys at once",
        "Up to 8 scripts at once",
        "3 project folders",
        "Unlimited obfuscation / mo",
        "Advanced webhook logs",
        "Keyless (FFA) mode",
        "24/7 Support",
        "Ad system (rewards)",
      ],
      badge: "Most Popular",
      badgeColor: "rgba(0, 200, 224, 0.2)",
      accentColor: "#00c8e0",
    },
    {
      name: "Pro",
      price: "$15",
      period: "/month",
      desc: "For large hubs requiring maximum capacity & features.",
      popular: false,
      buttonText: "Get Pro Access",
      buttonLink: "/register",
      features: [
        "Up to 10,000+ keys at once",
        "Up to 18 scripts at once",
        "6 project folders",
        "Unlimited obfuscation / mo",
        "API ratelimit bypass",
        "Custom branding & URLs",
        "24/7 Priority Discord Support",
        "Everything in Basic",
      ],
      badge: "Enterprise",
      badgeColor: "rgba(168, 85, 247, 0.2)",
      accentColor: "#a855f7",
    },
  ];

  return (
    <section style={{ width: "100%", maxWidth: 1120, margin: "80px auto 40px", padding: "0 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 50 }}>
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
          <i className="fa-solid fa-tags" style={{ fontSize: 11 }} />
          Simple &amp; Transparent Pricing
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          Choose the plan that fits your script hub
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 15, maxWidth: 540, margin: "0 auto" }}>
          Scale your authentication as your userbase grows. Switch or cancel anytime.
        </p>
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
                ? "linear-gradient(180deg, rgba(14, 25, 45, 0.85) 0%, rgba(9, 15, 28, 0.95) 100%)"
                : "rgba(13, 17, 26, 0.7)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: plan.popular
                ? "1px solid rgba(0, 200, 224, 0.4)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              padding: "36px 28px",
              display: "flex",
              flexDirection: "column",
              boxShadow: plan.popular
                ? "0 0 40px rgba(0, 200, 224, 0.15), 0 20px 50px rgba(0, 0, 0, 0.6)"
                : "0 10px 30px rgba(0, 0, 0, 0.4)",
              transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              if (plan.popular) {
                e.currentTarget.style.borderColor = "rgba(0, 200, 224, 0.7)";
                e.currentTarget.style.boxShadow = "0 0 50px rgba(0, 200, 224, 0.25), 0 24px 60px rgba(0,0,0,0.7)";
              } else {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              if (plan.popular) {
                e.currentTarget.style.borderColor = "rgba(0, 200, 224, 0.4)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(0, 200, 224, 0.15), 0 20px 50px rgba(0, 0, 0, 0.6)";
              } else {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              }
            }}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: -13,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #00c8e0 0%, #0099b5 100%)",
                  color: "#07080f",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 14px",
                  borderRadius: 100,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 15px rgba(0, 200, 224, 0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {plan.badge}
              </div>
            )}

            {/* Title & Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>{plan.name}</h3>
              {!plan.popular && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 100,
                    background: plan.badgeColor,
                    color: plan.accentColor,
                    border: `1px solid ${plan.accentColor}33`,
                  }}
                >
                  {plan.badge}
                </span>
              )}
            </div>

            <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.45)", minHeight: 38, marginBottom: 20 }}>
              {plan.desc}
            </p>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
                {plan.price}
              </span>
              <span style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.4)", fontWeight: 500 }}>
                {plan.period}
              </span>
            </div>

            {/* Button */}
            <Link
              href={plan.buttonLink}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 20px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
                background: plan.popular
                  ? "linear-gradient(135deg, #00c8e0 0%, #0099b5 100%)"
                  : "rgba(255, 255, 255, 0.06)",
                color: plan.popular ? "#07080f" : "#ffffff",
                border: plan.popular ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: plan.popular ? "0 4px 20px rgba(0, 200, 224, 0.3)" : "none",
                marginBottom: 28,
              }}
            >
              {plan.buttonText}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
            </Link>

            {/* Features list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                What&apos;s Included
              </div>
              {plan.features.map((feat) => (
                <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255, 255, 255, 0.7)" }}>
                  <i className="fa-solid fa-circle-check" style={{ color: plan.accentColor, fontSize: 14, flexShrink: 0 }} />
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
