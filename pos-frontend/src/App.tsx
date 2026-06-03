import React, { useState } from 'react';
import './app/globals.css';
import SalePage from './app/(pos)/sale/page';
import LoginPage from './app/(auth)/login/page';

function App() {
  const [session, setSession] = useState<{ isAuthenticated: boolean }>({
    isAuthenticated: false
  });

  const handleLoginSuccess = () => {
    setSession({ isAuthenticated: true });
  };

  const handleLogout = () => {
    setSession({ isAuthenticated: false });
  };

  if (session.isAuthenticated) {
    return (
      <div className="h-screen flex flex-col bg-stone-50 overflow-hidden font-sans">

        <header className="relative z-10 bg-white px-8 py-5 flex justify-between items-center shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-black text-xl text-white shadow-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg leading-tight text-stone-800">POS Nicolle</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Sistema de Caja
              </span>
            </div>
            <div className="ml-6 px-3 py-1.5 bg-stone-100 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[11px] font-bold uppercase text-stone-600">Modo Cajero</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-stone-500">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-sm font-bold transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
          </div>
        </header>
        <div className="relative z-10 flex-1 overflow-hidden">
          <SalePage />
        </div>
      </div>
    );
  }

  // Renders the Login page first
  return (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;