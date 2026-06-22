import React from "react";

type LogoVariant = "default" | "light" | "dark";

interface NikuHRLogoProps {
  variant?: LogoVariant;
  className?: string;
  showWordmark?: boolean;
}

const colors: Record<LogoVariant, { mark: string; accent: string; text: string }> = {
  default: { mark: "#0F172A", accent: "#4F46E5", text: "#0F172A" },
  light: { mark: "#FFFFFF", accent: "#818CF8", text: "#FFFFFF" },
  dark: { mark: "#F8FAFC", accent: "#818CF8", text: "#F8FAFC" },
};

/**
 * Modern HRMS wordmark: geometric "N" + connected people nodes (workforce network).
 */
const NikuHRLogo: React.FC<NikuHRLogoProps> = ({
  variant = "default",
  className = "",
  showWordmark = true,
}) => {
  const c = colors[variant];

  return (
    <span className={`niku-logo d-inline-flex align-items-center gap-2 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="niku-logo-mark flex-shrink-0"
      >
        <rect width="36" height="36" rx="10" fill={c.accent} fillOpacity="0.12" />
        <path
          d="M11 26V10h3.2l5.4 9.8V10H23v16h-3.1l-5.5-9.9V26H11z"
          fill={c.mark}
        />
        <circle cx="27" cy="12" r="2.5" fill={c.accent} />
        <circle cx="30" cy="18" r="2" fill={c.accent} fillOpacity="0.7" />
        <circle cx="27" cy="24" r="2" fill={c.accent} fillOpacity="0.5" />
        <path
          d="M27 14.5v3M28.5 17.5l1.2 1.2M27 21.5v-3"
          stroke={c.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className="niku-logo-text fw-bold" style={{ color: c.text, letterSpacing: "-0.03em" }}>
          Niku<span style={{ color: c.accent }}>HR</span>
        </span>
      )}
    </span>
  );
};

export default NikuHRLogo;
