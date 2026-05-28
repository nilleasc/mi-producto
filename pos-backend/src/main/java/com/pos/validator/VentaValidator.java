package com.pos.validator;

import java.util.Map;

public class VentaValidator {

    public void validarVenta(Map<String, Object> ventaMap) throws IllegalArgumentException {
        if (ventaMap == null) {
            throw new IllegalArgumentException("La estructura de la venta es nula.");
        }
        
        if (!ventaMap.containsKey("total")) {
            throw new IllegalArgumentException("Falta el campo 'total' en la venta.");
        }
        
        try {
            Double.parseDouble(String.valueOf(ventaMap.get("total")));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El campo 'total' debe ser un número válido.");
        }
        
        if (!ventaMap.containsKey("items")) {
            throw new IllegalArgumentException("Falta el campo 'items' en la venta.");
        }

        if (!ventaMap.containsKey("subtotal") || !ventaMap.containsKey("iva") || !ventaMap.containsKey("descuento")) {
            throw new IllegalArgumentException("Faltan campos matemáticos obligatorios (subtotal, iva, descuento).");
        }
    }
}
