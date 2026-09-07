'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, prefixIcon, suffixIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label-cap mb-2 flex items-center gap-1">
            {label}
            {required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}>
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`input-base ${prefixIcon ? 'pl-9' : ''} ${suffixIcon ? 'pr-9' : ''} ${
              error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/10' : ''
            } ${className}`}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-[11px] font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
