import React, { ReactNode } from 'react';
import './index.css';

type ButtonProps = {
  onClick: () => void;
  className?: string;
  children: ReactNode;
};

const Button = ({ onClick, className = '', children }: ButtonProps) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

export default Button;
