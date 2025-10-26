import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricGaugeProps {
  value: number; // 0-100
  label: string;
  description?: string;
  color?: 'primary' | 'accent' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function MetricGauge({ 
  value, 
  label, 
  description,
  color = 'primary',
  size = 'md' 
}: MetricGaugeProps) {
  const sizeConfig = {
    sm: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    md: { width: 160, strokeWidth: 10, fontSize: 'text-3xl' },
    lg: { width: 200, strokeWidth: 12, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    accent: 'stroke-accent',
    warning: 'stroke-warning',
    destructive: 'stroke-destructive',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-muted/30"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={cn(colorClasses[color], "drop-shadow-lg")}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={cn(config.fontSize, "font-bold bg-gradient-primary bg-clip-text text-transparent")}
          >
            {Math.round(value)}%
          </motion.span>
        </div>
      </div>

      <div className="text-center">
        <h3 className="font-semibold text-foreground">{label}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
