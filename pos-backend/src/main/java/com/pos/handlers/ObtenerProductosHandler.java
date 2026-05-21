package com.pos.handlers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.pos.repository.ProductoRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ObtenerProductosHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final Gson gson = new Gson();
    private final ProductoRepository repository;

    public ObtenerProductosHandler() {
        this.repository = new ProductoRepository();
    }

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        context.getLogger().log("Recibiendo peticion para obtener productos...");

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Access-Control-Allow-Origin", "*");

        String modoLocal = System.getProperty("IS_LOCAL", System.getenv("IS_LOCAL"));

        try {
            if ("true".equals(modoLocal)) {
                // --- MODO LOCAL: leer productos desde DynamoDB Local ---
                context.getLogger().log("Modo LOCAL: leyendo productos desde DynamoDB Local a través del Repository...");

                List<Map<String, Object>> productos = repository.obtenerProductosDeDynamo();

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
