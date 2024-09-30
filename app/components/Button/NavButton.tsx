import React from 'react';
import Link from 'next/link';
import '@/app/globals.css'; 

interface NavButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ href, onClick, children, className = '' }) => {
  const baseClassName = `nav-button ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClassName}>
      {children}
    </button>
  );
};

export default NavButton;