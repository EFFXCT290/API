// Simple classNames utility
export function cn(...args: any[]): string {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ');
} 