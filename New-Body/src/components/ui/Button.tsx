import type { ButtonHTMLAttributes } from 'react';

// Shared button component. `primary` is the solid gold call-to-action
// style (e.g. "Calculate my targets"); `secondary` is an outlined style
// for lower-emphasis actions (e.g. "Start over").
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const baseStyles =
    'px-6 py-3 rounded-full font-body font-semibold text-sm tracking-wide transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles =
    variant === 'primary'
      ? 'bg-gold text-ink hover:bg-ink hover:text-gold'
      : 'bg-transparent text-ink border border-ink/30 hover:border-ink';

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...rest}>
      {children}
    </button>
  );
}