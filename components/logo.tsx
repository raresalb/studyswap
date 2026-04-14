import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className, size = 32 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
      {/* Open book */}
      <path
        d="M20 12C20 12 14 11 10 13V28C14 26 20 27 20 27"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 12C20 12 26 11 30 13V28C26 26 20 27 20 27"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="20" y1="12" x2="20" y2="27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Swap arrows */}
      <path d="M13 32L17 29.5L13 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M27 27L23 29.5L27 32" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 29.5H23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ className, iconSize = 32, showText = true, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon size={iconSize} />
      {showText && (
        <span className={cn("font-bold gradient-text", textClassName)}>
          StudySwap
        </span>
      )}
    </div>
  );
}
