package com.pos.handlers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;

public class CrearVentaHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    // Inicializamos el cliente de DynamoDB y Gson una sola vez (mejora el rendimiento en Lambda "Warm Starts")
    private static final DynamoDbClient dynamoDb = DynamoDbClient.builder()
            .region(Region.US_EAST_1) // Asegúrate de que esta región coincida con la tuya
            .build();
    private static final Gson gson = new Gson();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        context.getLogger().log("Recibiendo nueva peticion de venta...");
        
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");
        
        try {
            // 1. Extraer y parsear el JSON del frontend
            String body = input.getBody();
            if (body == null || body.isEmpty()) {
                return crearRespuesta(400, headers, "{\"error\": \"El cuerpo de la peticion esta vacio\"}");
            }
            
            // Convertimos el JSON entrante a un Map para poder leer sus campos
            Map<String, Object> ventaMap = gson.fromJson(body, new TypeToken<Map<String, Object>>(){}.getType());
            
            // 2. Preparar los datos para DynamoDB
            String ventaId = UUID.randomUUID().toString();
            String fechaActual = Instant.now().toString();
            
            // Validar que venga el total
            if (!ventaMap.containsKey("total")) {
                return crearRespuesta(400, headers, "{\"error\": \"Falta el campo 'total' en la venta\"}");
            }

            // 3. Crear el Item (Fila) para insertar en DynamoDB
            Map<String, AttributeValue> itemValues = new HashMap<>();
            
            // Partition Key (ventaId)
            itemValues.put("ventaId", AttributeValue.builder().s(ventaId).build());
            
            // Atributos de la venta
            itemValues.put("fecha", AttributeValue.builder().s(fechaActual).build());
            itemValues.put("total", AttributeValue.builder().n(String.valueOf(ventaMap.get("total"))).build());
            
            // Si hay items comprados, los guardamos como un string JSON por simplicidad
            if (ventaMap.containsKey("items")) {
                String itemsJson = gson.toJson(ventaMap.get("items"));
                itemValues.put("items", AttributeValue.builder().s(itemsJson).build());
            }

            // 4. Ejecutar la inserción en la tabla 'ventas'
            PutItemRequest request = PutItemRequest.builder()
                .tableName("ventas")
                .item(itemValues)
                .build();
                
            dynamoDb.putItem(request);
            
            context.getLogger().log("Venta guardada exitosamente con ID: " + ventaId);
            
            // 5. Responder al Frontend (API Gateway)
            String jsonResponse = String.format("{ \"mensaje\": \"Venta guardada exitosamente en DynamoDB\", \"ventaId\": \"%s\" }", ventaId);
            return crearRespuesta(201, headers, jsonResponse);

        } catch (Exception e) {
            context.getLogger().log("Error al guardar la venta: " + e.getMessage());
            return crearRespuesta(500, headers, "{\"error\": \"Error interno en el servidor: " + e.getMessage() + "\"}");
        }
    }

    // Helper para generar las respuestas rápidamente
    private APIGatewayProxyResponseEvent crearRespuesta(int statusCode, Map<String, String> headers, String body) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setHeaders(headers);
        response.setStatusCode(statusCode);
        response.setBody(body);
        return response;
    }
}
