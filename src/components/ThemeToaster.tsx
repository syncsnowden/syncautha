"use client";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function ThemeToaster() {
  const [accent, setAccent] = useState("#00c8e0");

  useEffect(() => {
    const saved = localStorage.getItem("syncauth_theme") || "#00c8e0";
    setAccent(saved);
  }, []);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(10, 10, 15, 0.95)",
          backdropFilter: "blur(20px)",
          color: "#f0f4ff",
          border: `1px solid ${accent}40`,
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: { primary: accent, secondary: "#0a0a0f" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
