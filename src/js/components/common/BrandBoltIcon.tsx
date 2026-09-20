import React from "react";

type BrandBoltIconProps = React.SVGProps<SVGSVGElement>;

/** Renders the CrossLeague lightning-bolt mark at inline icon sizes. */
export const BrandBoltIcon: React.FC<BrandBoltIconProps> = ({ className, ...props }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className={className}
    {...props}
  >
    <path d="M18.5 4 8.75 17.25h6.5L13.5 28l9.75-13.25h-6.5L18.5 4Z" fill="currentColor" />
  </svg>
);
