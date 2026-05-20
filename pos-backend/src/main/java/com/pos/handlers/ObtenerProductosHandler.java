package com.pos.handlers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import com.google.gson.Gson;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ObtenerProductosHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    // Cliente DynamoDB inteligente: detecta si estamos en local o en nube
    private static final DynamoDbClient dynamoDb = crearClienteDynamoDb();
    private static final Gson gson = new Gson();

    /**
     * Crea el cliente de DynamoDB.
     * - En modo LOCAL (variable IS_LOCAL=true): conecta a http://localhost:8000
     * - En modo NUBE (AWS real): conecta automaticamente a AWS
     */
    private static DynamoDbClient crearClienteDynamoDb() {
        String modoLocal = System.getenv("IS_LOCAL");

        if ("true".equals(modoLocal)) {
            System.out.println("[ObtenerProductosHandler] Modo LOCAL: conectando a http://localhost:8000");
            return DynamoDbClient.builder()
                    .endpointOverride(URI.create("http://localhost:8000"))
                    .region(Region.US_EAST_1)
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create("dummy", "dummy")))
                    .build();
        }

        System.out.println("[ObtenerProductosHandler] Modo NUBE: conectando a AWS DynamoDB real");
        return DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .build();
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        context.getLogger().log("Recibiendo peticion para obtener productos...");

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");

        String modoLocal = System.getenv("IS_LOCAL");

        try {
            if ("true".equals(modoLocal)) {
                // --- MODO LOCAL: leer productos desde DynamoDB Local ---
                context.getLogger().log("Modo LOCAL: leyendo productos desde DynamoDB Local...");

                ScanRequest scanRequest = ScanRequest.builder()
                        .tableName("productos")
                        .build();

                ScanResponse scanResponse = dynamoDb.scan(scanRequest);
                List<Map<String, Object>> productos = new ArrayList<>();

                for (Map<String, AttributeValue> item : scanResponse.items()) {
                    Map<String, Object> producto = new HashMap<>();
                    producto.put("id", item.getOrDefault("productoId", AttributeValue.builder().s("").build()).s());
                    producto.put("sku", item.getOrDefault("sku", AttributeValue.builder().s("").build()).s());
                    producto.put("name", item.getOrDefault("nombre", AttributeValue.builder().s("").build()).s());
                    producto.put("stock", Integer.parseInt(item.getOrDefault("stock", AttributeValue.builder().n("0").build()).n()));
                    producto.put("categoryId", item.getOrDefault("categoria", AttributeValue.builder().s("").build()).s());
                    producto.put("isActive", item.getOrDefault("activo", AttributeValue.builder().bool(true).build()).bool());
                    producto.put("unitOfMeasure", "UND");
                    producto.put("variants", new ArrayList<>());
                    producto.put("imageUrl", null);

                    // Construir el objeto price
                    Map<String, Object> price = new HashMap<>();
                    price.put("amount", Integer.parseInt(item.getOrDefault("precio", AttributeValue.builder().n("0").build()).n()));
                    price.put("currency", item.getOrDefault("moneda", AttributeValue.builder().s("COP").build()).s());
                    producto.put("price", price);

                    productos.add(producto);
                }

                String jsonResponse = gson.toJson(productos);
                context.getLogger().log("Productos cargados desde DynamoDB Local: " + productos.size() + " items");
                return crearRespuesta(200, headers, jsonResponse);

            } else {
                // --- MODO NUBE: leer desde el archivo JSON empaquetado ---
                context.getLogger().log("Modo NUBE: leyendo productos desde productos.json...");
                var is = this.getClass().getClassLoader().getResourceAsStream("productos.json");
                if (is == null) {
                    return crearRespuesta(404, headers, "{\"error\": \"No se encontraron productos\"}");
                }
                String jsonContenido = new String(is.readAllBytes());
                return crearRespuesta(200, headers, jsonContenido);
            }

        } catch (Exception e) {
            context.getLogger().log("Error al leer los productos: " + e.getMessage());
            return crearRespuesta(500, headers, "{\"error\": \"Error interno en el servidor: " + e.getMessage() + "\"}");
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
