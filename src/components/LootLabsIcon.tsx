export default function LootLabsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="24" height="24" rx="6" fill="#6366f1" />
      <path d="M6 8h12M6 12h12M6 16h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="16" r="3" fill="#22c55e" />
      <path d="M17 15.5l.7.7 1.3-1.3" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
