import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import DynamicBackground from '../DynamicBackground';

const Layout = () => {
  return (
    <div className="min-h-screen relative flex flex-col">
      <DynamicBackground />
      <Header />
      <main className="flex-1 relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;