package com.pos.handlers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;

public class CrearVentaHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final DynamoDbClient dynamoDb = crearClienteDynamoDb();
    private static final Gson gson = new Gson();

    private static DynamoDbClient crearClienteDynamoDb() {
        String modoLocal = System.getProperty("IS_LOCAL", System.getenv("IS_LOCAL"));
        if ("true".equals(modoLocal)) {
            System.out.println("[CrearVentaHandler] Modo LOCAL -> http://localhost:8000");
            return DynamoDbClient.builder()
                    .endpointOverride(URI.create("http://localhost:8000"))
                    .region(Region.US_EAST_1)
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create("dummy", "dummy")))
                    .build();
        }
        System.out.println("[CrearVentaHandler] Modo NUBE -> AWS DynamoDB real");
        return DynamoDbClient.builder().region(Region.US_EAST_1).build();
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

            String ventaId = UUID.randomUUID().toString();
            String fechaActual = Instant.now().toString();

            if (!ventaMap.containsKey("total")) {
                return crearRespuesta(400, headers, "{\"error\": \"Falta el campo total en la venta\"}");
            }

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

            dynamoDb.putItem(PutItemRequest.builder().tableName("ventas").item(itemValues).build());
            context.getLogger().log("Venta guardada con ID: " + ventaId);

            return crearRespuesta(201, headers, String.format(
                "{\"mensaje\":\"Venta guardada exitosamente\",\"ventaId\":\"%s\",\"fecha\":\"%s\"}",
                ventaId, fechaActual));

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
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
