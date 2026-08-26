import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[42px]';

  const variants = {
    primary: 'bg-black text-white hover:bg-neutral-800 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-neutral-200',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-400 dark:bg-neutral-800 dark:text-white',
    outline: 'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 focus:ring-black dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[42px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : leftIcon ? (
        <span className="mr-2 inline-flex items-center">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="ml-2 inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};
