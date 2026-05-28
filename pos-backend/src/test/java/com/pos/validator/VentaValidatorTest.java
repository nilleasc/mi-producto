package com.pos.validator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("VentaValidator - Validaciones de estructura de venta")
class VentaValidatorTest {

    private VentaValidator validator;

    @BeforeEach
    void setUp() {
        validator = new VentaValidator();
    }

    // ── Caso exitoso ──────────────────────────────────────────────

    @Test
    @DisplayName("Debe aceptar una venta valida con total e items")
    void ventaValida_noLanzaExcepcion() {
        Map<String, Object> venta = new HashMap<>();
        venta.put("total", 25000.0);
        venta.put("items", List.of(Map.of("nombre", "Pan", "cantidad", 2)));

        assertDoesNotThrow(() -> validator.validarVenta(venta));
    }

    @Test
    @DisplayName("Debe aceptar una venta con total como String numerico")
    void ventaConTotalString_noLanzaExcepcion() {
        Map<String, Object> venta = new HashMap<>();
        venta.put("total", "15000");
        venta.put("items", List.of(Map.of("nombre", "Leche")));

        assertDoesNotThrow(() -> validator.validarVenta(venta));
    }

    // ── Venta nula ────────────────────────────────────────────────

    @Test
    @DisplayName("Debe lanzar excepcion cuando la venta es nula")
    void ventaNula_lanzaExcepcion() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validarVenta(null)
        );
        assertTrue(ex.getMessage().contains("nula"));
    }

    // ── Campo 'total' ─────────────────────────────────────────────

    @Test
    @DisplayName("Debe lanzar excepcion cuando falta el campo total")
    void ventaSinTotal_lanzaExcepcion() {
        Map<String, Object> venta = new HashMap<>();
        venta.put("items", List.of());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validarVenta(venta)
        );
        assertTrue(ex.getMessage().contains("total"));
    }

    @Test
    @DisplayName("Debe lanzar excepcion cuando el total no es numerico")
    void ventaConTotalInvalido_lanzaExcepcion() {
        Map<String, Object> venta = new HashMap<>();
        venta.put("total", "no-es-numero");
        venta.put("items", List.of());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validarVenta(venta)
        );
        assertTrue(ex.getMessage().contains("número válido"));
    }

    // ── Campo 'items' ─────────────────────────────────────────────

    @Test
    @DisplayName("Debe lanzar excepcion cuando falta el campo items")
    void ventaSinItems_lanzaExcepcion() {
        Map<String, Object> venta = new HashMap<>();
        venta.put("total", 10000);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validarVenta(venta)
        );
        assertTrue(ex.getMessage().contains("items"));
    }
}
