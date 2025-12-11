import React from 'react';
import { cn } from '../../utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400',
              'focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white',
              'transition-all duration-200 outline-none',
              'disabled:opacity-50 disabled:bg-gray-50',
              Icon && 'pl-10',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-200',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 ml-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
