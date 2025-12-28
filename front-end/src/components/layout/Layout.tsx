import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="layout-bg">
      <Navbar title={title} />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;