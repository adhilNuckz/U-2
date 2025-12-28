import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const baseClasses = 'btn-root';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
  };
  const widthClass = fullWidth ? 'btn-fullwidth' : '';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[baseClasses, variantClasses[variant], widthClass, className].join(' ')}
    >
      {children}
    </button>
  );
};

export default Button;