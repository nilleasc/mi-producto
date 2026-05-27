package com.pos.repository;

import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import java.util.Map;

/**
 * Interfaz para el repositorio de ventas.
 * Permite desacoplar la lógica del handler de la implementación concreta de DynamoDB,
 * facilitando las pruebas unitarias con mocks.
 */
public interface IVentaRepository {
    void guardarVenta(Map<String, AttributeValue> itemValues);
}
