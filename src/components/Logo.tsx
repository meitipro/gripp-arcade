export function Gripp({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="4" y="30" width="32" height="6" rx="3" fill="#202020" />
      <rect x="18" y="14" width="4" height="18" fill="#7A6B5A" />
      <circle cx="20" cy="13" r="5" fill="#B56654" />
      <path d="M20 13 L9 6 M20 13 L31 6" stroke="#B9986A" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
