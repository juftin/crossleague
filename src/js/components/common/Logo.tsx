import React from "react";

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", size, ...props }) => {
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
        <radialGradient id="reactLogoLeatherGlow" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="35%" stopColor="#8c3a10" />
          <stop offset="70%" stopColor="#5a2007" />
          <stop offset="100%" stopColor="#2d0e02" />
        </radialGradient>

        <linearGradient id="reactLogoLeatherSheen" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </linearGradient>

        <linearGradient id="reactLogoBoltYellowFacet" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="reactLogoBoltOrangeFacet" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <clipPath id="reactLogoBallClip">
          <path d="M -162 0 C -108 -104, 108 -104, 162 0 C 108 104, -108 104, -162 0 Z" />
        </clipPath>
      </defs>

      {/* Electric Sparks */}
      <g
        id="react-logo-sparks"
        fill="#facc15"
        stroke="#ca8a04"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <polygon points="172,50 196,86 182,90 206,124 192,126 214,148 188,142 198,118 178,114 190,82" />
        <polygon points="196,66 216,100 204,104 222,130 208,132 226,152 202,146 212,124 194,120 204,94" />

        <polygon points="132,124 168,154 154,158 178,188 162,192 182,212 154,206 166,182 146,180 158,150" />
        <polygon points="144,178 178,202 168,206 190,228 174,232 192,248 164,244 174,226 156,224 168,200" />

        <polygon points="292,374 274,396 284,400 268,424 282,428 266,450 290,438 280,418 296,414 286,394" />
        <polygon points="314,370 294,392 304,396 288,420 302,424 286,446 310,434 300,414 316,410 306,390" />
        <polygon points="334,364 314,386 324,390 308,414 322,418 306,440 330,428 320,408 336,404 326,384" />

        <polygon points="362,254 336,276 346,280 328,300 340,304 324,324 348,314 340,296 354,292 344,274" />
        <polygon points="382,286 356,306 366,310 348,330 360,334 344,354 368,344 360,326 374,322 364,304" />
      </g>

      {/* Football */}
      <g transform="translate(268, 238) rotate(-35)">
        <path
          d="M -178 0 C -118 -118, 118 -118, 178 0 C 118 118, -118 118, -178 0 Z"
          fill="#ffffff"
        />
        <path
          d="M -168 0 C -112 -110, 112 -110, 168 0 C 112 110, -112 110, -168 0 Z"
          fill="#0c1322"
        />
        <path
          d="M -162 0 C -108 -104, 108 -104, 162 0 C 108 104, -108 104, -162 0 Z"
          fill="url(#reactLogoLeatherGlow)"
        />

        <g clipPath="url(#reactLogoBallClip)">
          <path
            d="M -162 0 C -108 -104, 108 -104, 162 0 C 108 104, -108 104, -162 0 Z"
            fill="url(#reactLogoLeatherSheen)"
          />

          <path
            d="M -118 -82 C -136 -28, -136 28, -118 82 L -92 88 C -110 28, -110 -28, -92 -88 Z"
            fill="#ffffff"
            opacity="0.94"
          />
          <path
            d="M 92 -88 C 110 -28, 110 28, 92 88 L 118 82 C 136 28, 136 -28, 118 -82 Z"
            fill="#ffffff"
            opacity="0.94"
          />

          <polygon
            points="-30,-90 60,-5 20,95 -45,95 -10,0 -65,-90"
            fill="#150601"
            opacity="0.45"
          />
          <path d="M -155 -5 Q 0 -18 155 -5" stroke="#230a01" strokeWidth="3" fill="none" />
        </g>

        {/* Laces */}
        <g id="react-logo-laces">
          <path
            d="M -66 -30 Q 0 -44 66 -30"
            stroke="#1c0a00"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M -62 -30 Q 0 -44 62 -30"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
            <line x1="-52" y1="-41" x2="-52" y2="-19" />
            <line x1="-37" y1="-44" x2="-37" y2="-22" />
            <line x1="-22" y1="-47" x2="-22" y2="-25" />
            <line x1="-7" y1="-48" x2="-7" y2="-26" />
            <line x1="7" y1="-48" x2="7" y2="-26" />
            <line x1="22" y1="-47" x2="22" y2="-25" />
            <line x1="37" y1="-44" x2="37" y2="-22" />
            <line x1="52" y1="-41" x2="52" y2="-19" />
          </g>
        </g>
      </g>

      {/* Lightning Bolt */}
      <g id="react-logo-bolt">
        <polygon
          points="140,78 256,176 242,238 376,400 274,272 294,212"
          fill="#150601"
          opacity="0.55"
        />
        <polygon
          points="144,82 252,228 266,260 372,396 288,212"
          fill="url(#reactLogoBoltOrangeFacet)"
          stroke="#92400e"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="144,82 254,178 240,236 266,260 372,396 252,228"
          fill="url(#reactLogoBoltYellowFacet)"
          stroke="#f59e0b"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polyline
          points="144,82 252,228 266,260 372,396"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        <polygon points="240,236 266,260 252,228" fill="#fef08a" />
      </g>
    </svg>
  );
};
