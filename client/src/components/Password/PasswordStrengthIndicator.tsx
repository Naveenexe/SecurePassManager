import { calculatePasswordStrength } from "@/lib/crypto";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { score, label, color } = calculatePasswordStrength(password);

  const bars = Array.from({ length: 4 }, (_, index) => (
    <div
      key={index}
      className={`h-1 rounded-full flex-1 ${
        index < score ? 'opacity-100' : 'opacity-30'
      }`}
      style={{ 
        backgroundColor: index < score ? color : 'hsl(var(--muted))'
      }}
    />
  ));

  return (
    <div className="space-y-2" data-testid="password-strength-indicator">
      <div className="flex gap-1">
        {bars}
      </div>
      <p 
        className="text-xs font-medium"
        style={{ color }}
        data-testid="password-strength-label"
      >
        {label}
      </p>
    </div>
  );
}
