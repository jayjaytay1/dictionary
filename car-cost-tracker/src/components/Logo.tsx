/**
 * Brand mark — a custom car glyph inside the emerald→teal gradient badge.
 * `size` controls the badge; the glyph scales with it.
 */
export default function Logo({
  className = "",
  size = 36,
  rounded = "rounded-xl",
}: {
  className?: string;
  size?: number;
  rounded?: string;
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-accent-bright to-accent-2 shadow-[0_6px_20px_-6px_rgba(16,185,129,0.7)] ${rounded} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* soft top-light sheen */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="relative"
        style={{ width: size * 0.62, height: size * 0.62 }}
      >
        {/* car body */}
        <path
          d="M4 20.5 6.3 13.6C6.85 11.9 8.45 10.8 10.2 10.8h11.6c1.75 0 3.35 1.1 3.9 2.8L28 20.5v3.1c0 1-.8 1.8-1.8 1.8h-1.1a2.6 2.6 0 0 1-5.05 0h-8.1a2.6 2.6 0 0 1-5.05 0H5.8c-1 0-1.8-.8-1.8-1.8z"
          fill="#04160e"
        />
        {/* windshield / cabin glass */}
        <path
          d="M10.9 12.7h10.2l1.5 4.3c.13.36-.14.75-.53.75H9.93c-.39 0-.66-.39-.53-.75z"
          fill="#ffffff"
          fillOpacity="0.92"
        />
        {/* window divider */}
        <path d="M16 12.7v5.05" stroke="#04160e" strokeWidth="1.1" />
        {/* wheels */}
        <circle cx="10.6" cy="24.4" r="2.9" fill="#04160e" />
        <circle cx="21.4" cy="24.4" r="2.9" fill="#04160e" />
        <circle cx="10.6" cy="24.4" r="1.15" fill="#34d399" />
        <circle cx="21.4" cy="24.4" r="1.15" fill="#34d399" />
      </svg>
    </span>
  );
}
