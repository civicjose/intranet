// client/src/components/layout/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen md:flex">

      {/* Overlay para móvil (sin cambios) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- Sidebar --- */}
      {/* La sidebar se posiciona de forma fija en móvil y se vuelve parte del flujo en desktop */}
      <div className={`fixed inset-y-0 left-0 bg-macrosad-purple w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-20 flex-shrink-0`}>
        {/* 'flex-shrink-0' evita que la sidebar se encoja */}
        <Sidebar />
      </div>

      {/* --- Contenido Principal --- */}
      {/* CORRECCIÓN: Hemos eliminado 'md:ml-64'. Flexbox se encarga ahora del posicionamiento. */}
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;