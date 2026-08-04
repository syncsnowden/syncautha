"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function SuggestionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [suggestion, setSuggestion] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [warning, setWarning] = useState("");

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Live input warning for @everyone / @here
  const handleSuggestionChange = (val: string) => {
    setSuggestion(val);
    if (/@everyone|@here/i.test(val)) {
      setWarning("⚠️ Mentions like @everyone or @here are forbidden.");
    } else {
      setWarning("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before submitting again.`);
      return;
    }

    if (/@everyone|@here/i.test(suggestion)) {
      setWarning("⚠️ Cannot send! Pinging @everyone or @here is forbidden.");
      toast.error("Forbidden mentions detected!");
      return;
    }

    if (!suggestion.trim()) {
      toast.error("Please enter a valid suggestion.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion, username }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send suggestion.");
      }

      toast.success("Suggestion submitted! Thanks for helping improve SyncAuth.");
      setSuggestion("");
      setWarning("");
      setCooldown(20); // 20-second cooldown
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#0d0e14",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <i className="fa-solid fa-lightbulb" style={{ fontSize: 14 }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
                Submit a Suggestion
              </h3>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Help us make SyncAuth better</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 16,
              padding: 4,
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {warning && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              fontSize: 12.5,
              marginBottom: 16,
            }}
          >
            {warning}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Optional Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Your Discord / Username (Optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sync_dev#1337"
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 10,
                color: "#ffffff",
                fontSize: 13.5,
                padding: "10px 14px",
                outline: "none",
              }}
            />
          </div>

          {/* Suggestion Textarea */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Your Feedback or Feature Request
            </label>
            <textarea
              rows={4}
              value={suggestion}
              onChange={(e) => handleSuggestionChange(e.target.value)}
              placeholder="Tell us what feature or improvement you want to see..."
              required
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 10,
                color: "#ffffff",
                fontSize: 13.5,
                padding: "12px 14px",
                outline: "none",
                resize: "vertical",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || cooldown > 0 || !!warning}
            style={{
              marginTop: 6,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: cooldown > 0 || warning ? "rgba(255, 255, 255, 0.1)" : "#ffffff",
              color: cooldown > 0 || warning ? "#64748b" : "#08080a",
              fontWeight: 800,
              fontSize: 14,
              cursor: cooldown > 0 || warning || loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {loading
              ? "Sending..."
              : cooldown > 0
              ? `Cooldown (${cooldown}s)`
              : "Send Suggestion →"}
          </button>
        </form>
      </div>
    </div>
  );
}
