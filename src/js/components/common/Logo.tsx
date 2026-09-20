import React from "react";

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  size?: number | string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-8 h-8 object-contain",
  size,
  alt = "CrossLeague Football with Lightning Bolt Logo",
  ...props
}) => {
  return (
    <img src="/logo.png" alt={alt} className={className} width={size} height={size} {...props} />
  );
};
