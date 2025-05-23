import React from 'react';

/**
 * Reusable Checkbox component for consistent styling across the app.
 * Applies accent color and passes through all standard props.
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox: React.FC<CheckboxProps> = ({ className = '', ...props }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className={`peer sr-only ${className}`}
      {...props}
    />
    <span
      className={
        `h-3.5 w-3.5 rounded border border-gray-300 flex items-center justify-center
        bg-white peer-checked:bg-white transition-colors`
      }
    >
      {props.checked && (
        <svg className="w-4 h-4 text-primary-sand" viewBox="0 0 20 20" fill="none">
          <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="3" />
        </svg>
      )}
    </span>
  </label>
);

export default Checkbox;
