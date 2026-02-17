import type { SVGProps } from "react";

interface TelegramIconProps extends SVGProps<SVGSVGElement> {}

export function TelegramIcon(props: TelegramIconProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="120" cy="120" r="120" fill="#229ED9" />
      <path
        d="M179 72.6c2.2-9.5-7.4-8.7-12.6-6.7L53.5 110.1c-8.6 3.4-8.4 8.1-1.5 10.1l31.1 9.7 12 37.1c1.5 4.1.8 5.8 5.3 5.8 3.5 0 5-1.6 6.9-3.5l16.6-16.2 34.5 25.4c6.3 3.5 10.8 1.7 12.4-5.8L179 72.6zM97.7 151.5l-4.6-21.7 63.9-40.3-47.6 53.5-11.7 8.5z"
        fill="#fff"
      />
    </svg>
  );
}

