package com.pos.handlers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.pos.repository.IVentaRepository;
import com.pos.validator.VentaValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CrearVentaHandler - Manejo de peticiones Lambda para crear ventas")
class CrearVentaHandlerTest {

    @Mock
    private IVentaRepository repository;

    @Mock
    private Context context;

    @Mock
    private LambdaLogger logger;

    private CrearVentaHandler handler;

    @BeforeEach
    void setUp() {
        when(context.getLogger()).thenReturn(logger);
        handler = new CrearVentaHandler(new VentaValidator(), repository);
    }

    // ── Casos exitosos ────────────────────────────────────────────

    @Test
    @DisplayName("Debe retornar 201 al crear una venta valida")
    void ventaValida_retorna201() {
        String body = "{\"total\": 25000, \"items\": [{\"nombre\":\"Pan\",\"cantidad\":2}], \"cajero\": \"Juan\"}";
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(201, response.getStatusCode());
        assertTrue(response.getBody().contains("ventaId"));
        assertTrue(response.getBody().contains("Venta guardada exitosamente"));
        verify(repository, times(1)).guardarVenta(any());
    }

    @Test
    @DisplayName("Debe retornar 201 sin campo cajero (campo opcional)")
    void ventaSinCajero_retorna201() {
        String body = "{\"total\": 15000, \"items\": [{\"nombre\":\"Leche\"}]}";
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(201, response.getStatusCode());
        verify(repository).guardarVenta(any());
    }

    // ── Headers CORS ──────────────────────────────────────────────

    @Test
    @DisplayName("Debe incluir headers CORS en respuesta exitosa")
    void respuesta_incluyeHeadersCors() {
        String body = "{\"total\": 100, \"items\": []}";
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals("application/json", response.getHeaders().get("Content-Type"));
        assertEquals("*", response.getHeaders().get("Access-Control-Allow-Origin"));
    }

    // ── Body vacío / nulo ─────────────────────────────────────────

    @Test
    @DisplayName("Debe retornar 400 cuando el body es nulo")
    void bodyNulo_retorna400() {
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(null);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("vacio"));
        verify(repository, never()).guardarVenta(any());
    }

    @Test
    @DisplayName("Debe retornar 400 cuando el body esta vacio")
    void bodyVacio_retorna400() {
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody("");

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(400, response.getStatusCode());
        verify(repository, never()).guardarVenta(any());
    }

    // ── Errores de validación ─────────────────────────────────────

    @Test
    @DisplayName("Debe retornar 400 cuando falta el total")
    void ventaSinTotal_retorna400() {
        String body = "{\"items\": [{\"nombre\":\"Pan\"}]}";
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("total"));
        verify(repository, never()).guardarVenta(any());
    }

    @Test
    @DisplayName("Debe retornar 400 cuando faltan los items")
    void ventaSinItems_retorna400() {
        String body = "{\"total\": 5000}";
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("items"));
        verify(repository, never()).guardarVenta(any());
    }

    @Test
    @DisplayName("Debe retornar 400 cuando el total no es numerico")
    void totalNoNumerico_retorna400() {
        String body = "{\"total\": \"abc\", \"items\": []}";
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("número válido"));
        verify(repository, never()).guardarVenta(any());
    }

    // ── Error del repositorio (DynamoDB) ──────────────────────────

    @Test
    @DisplayName("Debe retornar 500 cuando DynamoDB falla")
    void errorDeDynamo_retorna500() {
        doThrow(new RuntimeException("Timeout en DynamoDB"))
                .when(repository).guardarVenta(any());

        String body = "{\"total\": 9000, \"items\": [{\"nombre\":\"Arroz\"}]}";
        APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
        request.setBody(body);

        APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("Timeout en DynamoDB"));
    }
}
