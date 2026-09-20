import React from "react";

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  variant?: "emerald" | "slate" | "leather" | "white";
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-8 h-8",
  size,
  variant = "emerald",
  ...props
}) => {
  const idPrefix = `cross-logo-${variant}`;

  let ballFill = "#10b981";
  let ballStroke = "#059669";
  let lacesColor = "#ffffff";
  let boltFill = `url(#${idPrefix}-bolt)`;
  let boltStroke = "#67e8f9";

  if (variant === "slate") {
    ballFill = "#0f172a";
    ballStroke = "#38bdf8";
    lacesColor = "#ffffff";
    boltFill = `url(#${idPrefix}-bolt)`;
    boltStroke = "#38bdf8";
  } else if (variant === "leather") {
    ballFill = "#854d0e";
    ballStroke = "#713f12";
    lacesColor = "#ffffff";
    boltFill = `url(#${idPrefix}-bolt)`;
    boltStroke = "#ffffff";
  } else if (variant === "white") {
    ballFill = "#f8fafc";
    ballStroke = "#cbd5e1";
    lacesColor = "#0f172a";
    boltFill = "#facc15";
    boltStroke = "#ffffff";
  }

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
        {variant === "emerald" || variant === "slate" ? (
          <linearGradient id={`${idPrefix}-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        ) : (
          <linearGradient id={`${idPrefix}-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        )}

        {/* Mathematically uniform 14px negative space clearance mask */}
        <mask id={`${idPrefix}-mask`}>
          <rect x="0" y="0" width="512" height="512" fill="#ffffff" />
          <polygon
            points="197.0,-25.0 356.0,227.0 284.0,246.0 346.0,537.0 167.0,286.0 238.0,266.0"
            fill="#000000"
          />
        </mask>
      </defs>

      {/* FOOTBALL: Parted cleanly by negative-space channel */}
      <g mask={`url(#${idPrefix}-mask)`} transform="translate(256, 256) rotate(-30)">
        <path
          d="M -180 0 C -120 -116, 120 -116, 180 0 C 120 116, -120 116, -180 0 Z"
          fill={ballFill}
          stroke={ballStroke}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Left Stripe */}
        <path
          d="M -124 -68 C -138 -25, -138 25, -124 68 L -104 78 C -118 25, -118 -25, -104 -78 Z"
          fill={lacesColor}
        />

        {/* Right Stripe */}
        <path
          d="M 104 -78 C 118 -25, 118 25, 104 78 L 124 68 C 138 25, 138 -25, 124 -68 Z"
          fill={lacesColor}
        />

        {/* Seam */}
        <line
          x1="-72"
          y1="0"
          x2="72"
          y2="0"
          stroke={lacesColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Laces */}
        <rect x="-56" y="-18" width="8" height="36" rx="4" fill={lacesColor} />
        <rect x="-34" y="-20" width="8" height="40" rx="4" fill={lacesColor} />
        <rect x="-12" y="-21" width="8" height="42" rx="4" fill={lacesColor} />
        <rect x="10" y="-21" width="8" height="42" rx="4" fill={lacesColor} />
        <rect x="32" y="-20" width="8" height="40" rx="4" fill={lacesColor} />
        <rect x="54" y="-18" width="8" height="36" rx="4" fill={lacesColor} />
      </g>

      {/* LIGHTNING BOLT */}
      <polygon
        points="220.0,38.0 334.0,218.0 268.0,236.0 318.0,474.0 190.0,294.0 254.0,276.0"
        fill={boltFill}
        stroke={boltStroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Athletic Bevel Facet */}
      <polygon
        points="220.0,38.0 334.0,218.0 268.0,236.0 254.0,276.0"
        fill="#ffffff"
        opacity="0.25"
      />
    </svg>
  );
};
