import React, { useState, useEffect, useRef } from 'react';

const VALID_USER = 'user1';
const VALID_PASS = '12345';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const SHORTCUTS = [
  { keys: ['F2'], description: 'Autocompletar credenciales demo' },
  { keys: ['F3'], description: 'Mostrar / ocultar contraseña' },
  { keys: ['F4'], description: 'Enfocar campo usuario' },
  { keys: ['Enter'], description: 'Enviar formulario' },
  { keys: ['Tab'], description: 'Saltar al siguiente campo' },
];

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [demoFilled, setDemoFilled] = useState(false);

  const shortcutMenuRef = useRef<HTMLDivElement>(null);

  // Atajo Ctrl+D → rellena credenciales demo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setUsername(VALID_USER);
        setPassword(VALID_PASS);
        setError('');
        setDemoFilled(true);
        setTimeout(() => setDemoFilled(false), 2000);
      }
      if (e.key === 'F3') {
        e.preventDefault();
        setShowPass((prev) => !prev);
      }
      if (e.key === 'F4') {
        e.preventDefault();
        document.getElementById('login-username')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shortcutMenuRef.current && !shortcutMenuRef.current.contains(e.target as Node)) {
        setShowShortcuts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (username === VALID_USER && password === VALID_PASS) {
      onLoginSuccess();
    } else {
      setError('Usuario o contraseña incorrectos.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl" />
      </div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-sm mx-4">

        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-4">
            POS
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-tight">Bienvenido</h1>
          <p className="text-gray-400 text-sm mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl space-y-5"
        >
          {/* Cabecera del formulario con botón de atajos */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Acceso al sistema</span>

            {/* Botón de atajos con menú desplegable */}
            <div className="relative" ref={shortcutMenuRef}>
              <button
                type="button"
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors cursor-pointer"
                aria-label="Ver atajos de teclado"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Atajos
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-3 h-3 transition-transform duration-200 ${showShortcuts ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menú desplegable de atajos */}
              {showShortcuts && (
                <div className="absolute right-0 top-7 z-50 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 animate-in">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2 px-1">
                    Atajos de teclado
                  </p>
                  <ul className="space-y-1.5">
                    {SHORTCUTS.map((shortcut, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 px-1">
                        <span className="text-gray-300 text-xs">{shortcut.description}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {shortcut.keys.map((key, j) => (
                            <React.Fragment key={j}>
                              <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px] text-gray-300 font-mono leading-tight">
                                {key}
                              </kbd>
                              {j < shortcut.keys.length - 1 && (
                                <span className="text-gray-600 text-[10px]">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Botón rápido para rellenar demo */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setUsername(VALID_USER);
                        setPassword(VALID_PASS);
                        setError('');
                        setShowShortcuts(false);
                        setDemoFilled(true);
                        setTimeout(() => setDemoFilled(false), 2000);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Usar credenciales demo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Toast de demo autocompleted */}
          {demoFilled && (
            <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-700 text-blue-300 text-xs rounded-xl px-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Credenciales demo autocomplete → presiona Enter
            </div>
          )}

          {/* Campo: Usuario */}
          <div className="space-y-1.5">
            <label htmlFor="login-username" className="text-gray-300 text-sm font-medium block text-left">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user1"
                required
                autoComplete="username"
                className="w-full bg-gray-900 text-white placeholder-gray-600 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Campo: Contraseña */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-gray-300 text-sm font-medium block text-left">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                autoComplete="current-password"
                className="w-full bg-gray-900 text-white placeholder-gray-600 border border-gray-700 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {/* Botón submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verificando...
              </>
            ) : (
              <>
                Iniciar sesión
                <kbd className="ml-1 px-1.5 py-0.5 bg-blue-400/30 rounded text-[10px] font-mono">↵</kbd>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Sistema POS &copy; {new Date().getFullYear()} — <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-400">F2</kbd> demo · <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-400">F3</kbd> contraseña · <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-400">F4</kbd> usuario
        </p>
      </div>
    </main>
  );
}
