'use client';

import { useEffect, useCallback } from 'react';
import { KeyboardShortcut, ShortcutHandler, KeyboardShortcutService } from '../../infrastructure/keyboard/KeyboardShortcutService';

export type { KeyboardShortcut };

/**
 * Hook para registrar atajos de teclado en componentes React.
 *
 * Inicia el servicio al montar y registra/limpia los handlers
 * automáticamente con el ciclo de vida del componente.
 *
 * @example
 * useKeyboardShortcuts({
 *   [KeyboardShortcut.NUEVA_VENTA]: () => actions.startNewSale(),
 *   [KeyboardShortcut.BUSCAR_PRODUCTO]: () => focusSearch(),
 * });
 */
export function useKeyboardShortcuts(
  shortcuts: Partial<Record<KeyboardShortcut, ShortcutHandler>>
): void {
  useEffect(() => {
    KeyboardShortcutService.startListening();

    const cleanups: Array<() => void> = [];

    for (const [shortcut, handler] of Object.entries(shortcuts)) {
      if (handler) {
        const cleanup = KeyboardShortcutService.register(
          shortcut as KeyboardShortcut,
          handler
        );
        cleanups.push(cleanup);
      }
    }

    return () => {
      cleanups.forEach(fn => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Hook para registrar un único shortcut dinámico.
 * Útil cuando el handler depende de estado local.
 */
export function useShortcut(
  shortcut: KeyboardShortcut,
  handler: ShortcutHandler,
  deps: React.DependencyList = []
): void {
  const stableHandler = useCallback(handler, deps);

  useEffect(() => {
    KeyboardShortcutService.startListening();
    const cleanup = KeyboardShortcutService.register(shortcut, stableHandler);
    return cleanup;
  }, [shortcut, stableHandler]);
}