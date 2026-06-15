import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const location = useLocation();

  return (
    <>
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main key={location.pathname} className="flex-1 overflow-y-auto bg-[var(--color-surface-base)] relative flex flex-col pt-0 pb-6 w-full animate-fade-in">
          <Outlet />
        </main>
      </div>
    </>
  );
}
