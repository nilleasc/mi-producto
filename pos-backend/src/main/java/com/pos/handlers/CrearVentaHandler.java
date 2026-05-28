package com.pos.handlers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.pos.repository.IVentaRepository;
import com.pos.repository.VentaRepository;
import com.pos.validator.VentaValidator;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CrearVentaHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final Gson gson = new Gson();
    private final VentaValidator validator;
    private final IVentaRepository repository;

    /** Constructor por defecto usado por AWS Lambda */
    public CrearVentaHandler() {
        this.validator = new VentaValidator();
        this.repository = new VentaRepository();
    }

    /** Constructor para inyeccion de dependencias (usado en tests) */
    CrearVentaHandler(VentaValidator validator, IVentaRepository repository) {
        this.validator = validator;
        this.repository = repository;
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        context.getLogger().log("Recibiendo nueva peticion de venta...");

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");

        try {
            String body = input.getBody();
            if (body == null || body.isEmpty()) {
                return crearRespuesta(400, headers, "{\"error\": \"El cuerpo de la peticion esta vacio\"}");
            }

            Map<String, Object> ventaMap = gson.fromJson(body, new TypeToken<Map<String, Object>>(){}.getType());

            // 1. Validator
            validator.validarVenta(ventaMap);

            String ventaId = UUID.randomUUID().toString();
            String fechaActual = Instant.now().toString();

            Map<String, AttributeValue> itemValues = new HashMap<>();
            itemValues.put("ventaId", AttributeValue.builder().s(ventaId).build());
            itemValues.put("fecha", AttributeValue.builder().s(fechaActual).build());
            itemValues.put("total", AttributeValue.builder().n(String.valueOf(ventaMap.get("total"))).build());

            if (ventaMap.containsKey("items")) {
                itemValues.put("items", AttributeValue.builder().s(gson.toJson(ventaMap.get("items"))).build());
            }
            if (ventaMap.containsKey("cajero")) {
                itemValues.put("cajero", AttributeValue.builder().s(String.valueOf(ventaMap.get("cajero"))).build());
            }

            // 2. Repository
            repository.guardarVenta(itemValues);
            context.getLogger().log("Venta guardada con ID: " + ventaId);

            return crearRespuesta(201, headers, String.format(
                "{\"mensaje\":\"Venta guardada exitosamente\",\"ventaId\":\"%s\",\"fecha\":\"%s\"}",
                ventaId, fechaActual));

        } catch (IllegalArgumentException e) {
            context.getLogger().log("Error de validacion: " + e.getMessage());
            return crearRespuesta(400, headers, "{\"error\":\"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            context.getLogger().log("Error interno: " + e.getMessage());
            return crearRespuesta(500, headers, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private APIGatewayProxyResponseEvent crearRespuesta(int statusCode, Map<String, String> headers, String body) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setHeaders(headers);
        response.setStatusCode(statusCode);
        response.setBody(body);
        return response;
    }
}
