/**
 * Servicio de atajos de teclado para POS
 *
 * Gestiona los shortcuts del terminal sin acoplar a componentes.
 * Soporta teclas de funcion (F1-F12), CTRL+clave y Escape/Enter.
 */

/** Identificadores canónicos de todos los shortcuts del POS */
export enum KeyboardShortcut {
  // Teclas de función
  NUEVA_VENTA          = 'F1',
  BUSCAR_PRODUCTO      = 'F2',
  HISTORIAL_VENTAS     = 'F3',
  VENTAS_CONGELADAS    = 'F4',
  AGREGAR_MANUAL       = 'F5',
  ESCANEAR_BARCODE     = 'F6',
  APLICAR_DESCUENTO    = 'F7',
  CONFIGURACION        = 'F8',
  AYUDA_ATAJOS         = 'F9',
  CERRAR_VENTA         = 'F10',
  IMPRIMIR_FACTURA     = 'F11',
  PANTALLA_COMPLETA    = 'F12',

  // CTRL + tecla
  CTRL_BUSCAR          = 'Ctrl+b',
  CTRL_PAGAR           = 'Ctrl+p',
  CTRL_HISTORIAL       = 'Ctrl+h',
  CTRL_CONGELAR        = 'Ctrl+f',
  CTRL_RECUPERAR       = 'Ctrl+r',

  // Especiales
  ESCAPE               = 'Escape',
  ENTER                = 'Enter',
}

export type ShortcutHandler = () => void;

/** Descripcion legible de cada shortcut */
const SHORTCUT_DESCRIPTIONS: Record<KeyboardShortcut, string> = {
  [KeyboardShortcut.NUEVA_VENTA]:       'Nueva Venta',
  [KeyboardShortcut.BUSCAR_PRODUCTO]:   'Buscar Producto',
  [KeyboardShortcut.HISTORIAL_VENTAS]:  'Historial de Ventas',
  [KeyboardShortcut.VENTAS_CONGELADAS]: 'Ventas Congeladas',
  [KeyboardShortcut.AGREGAR_MANUAL]:    'Agregar Producto Manual',
  [KeyboardShortcut.ESCANEAR_BARCODE]:  'Escanear Código de Barras',
  [KeyboardShortcut.APLICAR_DESCUENTO]: 'Aplicar Descuento',
  [KeyboardShortcut.CONFIGURACION]:     'Configuración',
  [KeyboardShortcut.AYUDA_ATAJOS]:      'Ayuda de Atajos',
  [KeyboardShortcut.CERRAR_VENTA]:      'Cerrar Venta',
  [KeyboardShortcut.IMPRIMIR_FACTURA]:  'Imprimir Factura',
  [KeyboardShortcut.PANTALLA_COMPLETA]: 'Modo Pantalla Completa',
  [KeyboardShortcut.CTRL_BUSCAR]:       'Buscar Producto',
  [KeyboardShortcut.CTRL_PAGAR]:        'Procesar Pago',
  [KeyboardShortcut.CTRL_HISTORIAL]:    'Historial',
  [KeyboardShortcut.CTRL_CONGELAR]:     'Congelar Venta',
  [KeyboardShortcut.CTRL_RECUPERAR]:    'Recuperar Venta Congelada',
  [KeyboardShortcut.ESCAPE]:            'Cancelar / Cerrar diálogo',
  [KeyboardShortcut.ENTER]:             'Confirmar acción',
};

/** Teclas de función que deben bloquear el comportamiento del navegador */
const FUNCTION_KEYS = new Set([
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
]);

/**
 * Convierte un evento de teclado en la clave canónica del shortcut.
 * Retorna null si no hay coincidencia.
 */
function eventToShortcutKey(event: KeyboardEvent): string | null {
  const key = event.key;

  // CTRL + letra (normalizado a minúsculas)
  if (event.ctrlKey && key.length === 1) {
    return `Ctrl+${key.toLowerCase()}`;
  }

  // Teclas sin modificadores (Fn, Escape, Enter)
  if (!event.ctrlKey && !event.altKey && !event.metaKey) {
    return key;
  }

  return null;
}

class KeyboardShortcutServiceImpl {
  private handlers: Map<string, Set<ShortcutHandler>> = new Map();
  private isListening = false;

  /** Inicia la escucha global de keydown */
  startListening(): void {
    if (this.isListening || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.handleKeyDown);
    this.isListening = true;
  }

  /** Detiene la escucha */
  stopListening(): void {
    if (!this.isListening || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.handleKeyDown);
    this.isListening = false;
  }

  /**
   * Registra un handler para un shortcut.
   * Retorna función de cleanup (unregister).
   */
  register(shortcut: KeyboardShortcut, handler: ShortcutHandler): () => void {
    const key = shortcut as string;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(handler);
    return () => {
      const set = this.handlers.get(key);
      if (set) {
        set.delete(handler);
        if (set.size === 0) this.handlers.delete(key);
      }
    };
  }

  /** Manejador interno del evento keydown */
  private handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    const inInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    const shortcutKey = eventToShortcutKey(event);
    if (!shortcutKey) return;

    // En inputs solo permitir Escape y Enter
    if (inInput && shortcutKey !== 'Escape' && shortcutKey !== 'Enter') return;

    const set = this.handlers.get(shortcutKey);
    if (!set || set.size === 0) return;

    // Bloquear comportamiento nativo en teclas de función y CTRL+combos
    if (FUNCTION_KEYS.has(shortcutKey) || event.ctrlKey) {
      event.preventDefault();
    }

    set.forEach(handler => {
      try { handler(); }
      catch (err) { console.error(`Shortcut error [${shortcutKey}]:`, err); }
    });
  };

  /** Descripción legible de un shortcut */
  getDescription(shortcut: KeyboardShortcut): string {
    return SHORTCUT_DESCRIPTIONS[shortcut] ?? shortcut;
  }

  /** Lista completa de shortcuts con su descripción */
  getAllShortcuts(): Array<{ shortcut: KeyboardShortcut; key: string; description: string }> {
    return Object.values(KeyboardShortcut).map(s => ({
      shortcut: s,
      key: s as string,
      description: SHORTCUT_DESCRIPTIONS[s] ?? s,
    }));
  }

  /** Limpia todos los handlers (útil en tests) */
  clear(): void {
    this.handlers.clear();
  }
}

// Singleton global
export const KeyboardShortcutService = new KeyboardShortcutServiceImpl();