import { motion } from 'framer-motion';

interface Props {
  score: number;
  size?: number;
}

export default function SecurityScoreGauge({ score, size = 200 }: Props) {
  const r = (size - 20) / 2;
  const circumference = Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(160, 100%, 50%)' : score >= 50 ? 'hsl(45, 100%, 55%)' : 'hsl(0, 80%, 55%)';
  const glowColor = score >= 80 ? 'hsl(160, 100%, 50%)' : score >= 50 ? 'hsl(45, 100%, 55%)' : 'hsl(0, 80%, 55%)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.65 }}>
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        <path
          d={`M 10 ${size * 0.6} A ${r} ${r} 0 0 1 ${size - 10} ${size * 0.6}`}
          fill="none"
          stroke="hsl(220, 15%, 16%)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          d={`M 10 ${size * 0.6} A ${r} ${r} 0 0 1 ${size - 10} ${size * 0.6}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <motion.span
          className="text-4xl font-bold font-mono"
          style={{ color, textShadow: `0 0 15px ${glowColor}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  );
}
