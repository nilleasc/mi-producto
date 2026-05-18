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
      <div className="h-screen flex flex-col">
        <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black">P</div>
            <span className="font-bold tracking-tight">POS Sebastian</span>
            <span className="ml-4 px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold uppercase text-blue-400 border border-blue-400/30">
              Modo Cajero
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </header>
        <div className="flex-1 overflow-hidden">
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