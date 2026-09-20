import React from "react";

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  variant?: "cyber" | "leather";
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-8 h-8",
  size,
  variant = "cyber",
  ...props
}) => {
  const isCyber = variant === "cyber";
  const idPrefix = isCyber ? "cross-logo-cyber" : "cross-logo-leather";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      role="img"
      aria-label="CrossLeague Football with Lightning Bolt Logo"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      <defs>
        <filter id={`${idPrefix}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#000000" floodOpacity="0.65" />
        </filter>

        <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={`${idPrefix}-aura`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>

        {isCyber ? (
          <>
            <linearGradient id={`${idPrefix}-leather`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
            </linearGradient>
          </>
        ) : (
          <>
            <linearGradient id={`${idPrefix}-leather`} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="30%" stopColor="#78350f" />
              <stop offset="75%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#1c0a00" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#fef3c7" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </linearGradient>
          </>
        )}

        <linearGradient id={`${idPrefix}-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#34d399" />
          <stop offset="70%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-core`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>

        <clipPath id={`${idPrefix}-clip`}>
          <path d="M -176 0 C -116 -120, 116 -120, 176 0 C 116 120, -116 120, -176 0 Z" />
        </clipPath>
      </defs>

      {/* Backdrop Aura */}
      <circle cx="256" cy="256" r="225" fill={`url(#${idPrefix}-aura)`} />

      {/* Football Group */}
      <g transform="translate(256, 256) rotate(-28)" filter={`url(#${idPrefix}-shadow)`}>
        <path
          d="M -180 0 C -119 -124, 119 -124, 180 0 C 119 124, -119 124, -180 0 Z"
          fill="none"
          stroke={`url(#${idPrefix}-rim)`}
          strokeWidth="5"
        />

        <path
          d="M -176 0 C -116 -120, 116 -120, 176 0 C 116 120, -116 120, -176 0 Z"
          fill={`url(#${idPrefix}-leather)`}
        />

        <g clipPath={`url(#${idPrefix}-clip)`}>
          <path
            d="M -176 0 C -116 -120, 116 -120, 176 0 C 116 120, -116 120, -176 0 Z"
            fill={`url(#${idPrefix}-sheen)`}
          />

          <path
            d="M -122 -72 C -136 -25, -136 25, -122 72 L -100 83 C -114 25, -114 -25, -100 -83 Z"
            fill="#f8fafc"
          />
          {isCyber && (
            <path
              d="M -122 -72 C -136 -25, -136 25, -122 72"
              stroke="#38bdf8"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
            />
          )}

          <path
            d="M 100 -83 C 114 -25, 114 25, 100 83 L 122 72 C 136 25, 136 -25, 122 -72 Z"
            fill="#f8fafc"
          />
          {isCyber && (
            <path
              d="M 122 -72 C 136 -25, 136 25, 122 72"
              stroke="#38bdf8"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
            />
          )}
        </g>

        {/* Center Seam */}
        <line
          x1="-80"
          y1="0"
          x2="-35"
          y2="0"
          stroke={isCyber ? "#475569" : "#2d1204"}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="0"
          x2="80"
          y2="0"
          stroke={isCyber ? "#475569" : "#2d1204"}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Laces */}
        <g fill="#ffffff">
          <rect x="-62" y="-18" width="7" height="36" rx="3.5" />
          <rect x="-44" y="-20" width="7.5" height="40" rx="3.75" />
          <rect x="-26" y="-21" width="7.5" height="42" rx="3.75" />
          <rect x="18" y="-21" width="7.5" height="42" rx="3.75" />
          <rect x="36" y="-20" width="7.5" height="40" rx="3.75" />
          <rect x="54" y="-18" width="7" height="36" rx="3.5" />

          <rect x="-64" y="-3.5" width="44" height="7" rx="3.5" />
          <rect x="20" y="-3.5" width="44" height="7" rx="3.5" />
        </g>
      </g>

      {/* Surface Fracture Sparks */}
      <path
        d="M 242 165 L 222 145 M 268 185 L 290 170"
        stroke={isCyber ? "#22d3ee" : "#facc15"}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 248 340 L 228 355 M 274 322 L 298 335"
        stroke="#22d3ee"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Lightning Bolt Cutting Through */}
      <path
        d="M 230 12 L 326 206 L 248 232 L 338 506 L 194 306 L 272 280 Z"
        fill="#020617"
        opacity="0.96"
      />

      <path
        d="M 230 24 L 314 210 L 254 230 L 330 492 L 206 302 L 266 282 Z"
        fill={`url(#${idPrefix}-bolt)`}
        filter={`url(#${idPrefix}-glow)`}
        opacity="0.7"
      />

      <path
        d="M 230 24 L 314 210 L 254 230 L 330 492 L 206 302 L 266 282 Z"
        fill={`url(#${idPrefix}-bolt)`}
        stroke="#67e8f9"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M 230 36 L 302 210 L 258 224 L 320 472 L 218 300 L 262 286 Z"
        fill={`url(#${idPrefix}-core)`}
        opacity="0.95"
      />

      {/* Sparks */}
      <line
        x1="228"
        y1="20"
        x2="205"
        y2="8"
        stroke="#fef08a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="235"
        y1="35"
        x2="260"
        y2="22"
        stroke="#67e8f9"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="198" cy="12" r="3" fill="#fef08a" />
      <circle cx="265" cy="24" r="2.5" fill="#ffffff" />

      <circle cx="318" cy="208" r="3" fill="#ffffff" />
      <circle cx="204" cy="304" r="3" fill="#ffffff" />

      <line
        x1="332"
        y1="494"
        x2="354"
        y2="512"
        stroke="#22d3ee"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="324"
        y1="485"
        x2="306"
        y2="502"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="358" cy="515" r="3" fill="#ecfeff" />
      <circle cx="300" cy="505" r="2.5" fill="#34d399" />
    </svg>
  );
};
