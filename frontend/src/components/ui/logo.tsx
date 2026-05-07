import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export function LogoMark({ size = 32, className, withGlow }: LogoProps) {
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      {withGlow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-[28%] blur-md opacity-70"
          style={{
            background: 'linear-gradient(135deg,#a78bfa 0%,#ec4899 50%,#3b82f6 100%)',
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-[0_2px_6px_rgba(124,58,237,0.35)]"
      >
        <defs>
          <linearGradient id="taskmeter-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="55%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="taskmeter-grad-2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#taskmeter-grad)" />
        <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#taskmeter-grad-2)" />
        <g transform="translate(8 9)">
          <path
            d="M12 0 L24 6 L12 12 L0 6 Z"
            fill="#ffffff"
            fillOpacity="0.95"
          />
          <path
            d="M12 8 L24 14 L12 20 L0 14 Z"
            fill="#ffffff"
            fillOpacity="0.7"
          />
          <path
            d="M12 16 L24 22 L12 28 L0 22 Z"
            fill="#ffffff"
            fillOpacity="0.45"
          />
        </g>
      </svg>
    </span>
  );
}

export function Logo({
  size = 28,
  className,
  showWordmark = true,
  showTagline = false,
  withGlow = false,
}: LogoProps & { showWordmark?: boolean; showTagline?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={size} withGlow={withGlow} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight">
            taskMeter
            <span className="ml-0.5 text-primary">.</span>
          </span>
          {showTagline && (
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Task Manager
            </span>
          )}
        </span>
      )}
    </span>
  );
}
