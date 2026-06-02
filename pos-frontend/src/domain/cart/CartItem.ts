import { ErrorCode } from '../errors/Errors';

/**
 * Representa un producto dentro del carrito POS
 */
export interface CartItem {

    /** ID único del producto */
    productoId: string;

    /** Nombre para mostrar en UI */
    nombreProducto: string;

    /** Precio oficial devuelto por backend */
    precioOficial: number;

    /** Cantidad seleccionada */
    cantidad: number;

    /** Precio manual opcional */
    precioOverride?: number;

    /** Supervisor que autorizó override */
    autorizadoPor?: string;

    /** Precio realmente usado */
    precioAplicado: number;

    /** precioAplicado × cantidad */
    subtotal: number;

    /** Error backend asociado */
    errorCodigo?: ErrorCode;

}