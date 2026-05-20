package com.pos;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.pos.handlers.CrearVentaHandler;
import com.pos.handlers.ObtenerProductosHandler;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.Scanner;

public class LocalApiServer {

    public static void main(String[] args) throws Exception {
        // Asegurar que estamos en modo local para los handlers
        System.setProperty("IS_LOCAL", "true");

        // Crear servidor en puerto 3000
        HttpServer server = HttpServer.create(new InetSocketAddress(3000), 0);

        // Rutas
        server.createContext("/productos", new ProductosHttpHandler());
        server.createContext("/ventas", new VentasHttpHandler());

        server.setExecutor(null); // crea un ejecutor por defecto
        server.start();

        System.out.println("\n=======================================================");
        System.out.println(" 🚀 API LOCAL INICIADA EXITOSAMENTE");
        System.out.println(" 📡 Escuchando en: http://localhost:3000");
        System.out.println(" 🔌 Endpoints:");
        System.out.println("    GET  http://localhost:3000/productos");
        System.out.println("    POST http://localhost:3000/ventas");
        System.out.println("=======================================================\n");
    }

    // --- Manejadores HTTP que envuelven a los Handlers de AWS ---

    static class ProductosHttpHandler implements HttpHandler {
        private final ObtenerProductosHandler lambdaHandler = new ObtenerProductosHandler();

        @Override
        public void handle(HttpExchange exchange) {
            manejarPeticion(exchange, "GET", lambdaHandler);
        }
    }

    static class VentasHttpHandler implements HttpHandler {
        private final CrearVentaHandler lambdaHandler = new CrearVentaHandler();

        @Override
        public void handle(HttpExchange exchange) {
            manejarPeticion(exchange, "POST", lambdaHandler);
        }
    }

    private static void manejarPeticion(HttpExchange exchange, String metodoEsperado, com.amazonaws.services.lambda.runtime.RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> handler) {
        try {
            // Manejo de CORS (Preflight OPTIONS)
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            // Validar método
            if (!metodoEsperado.equalsIgnoreCase(exchange.getRequestMethod())) {
                enviarRespuesta(exchange, 405, "{\"error\": \"Metodo no permitido\"}");
                return;
            }

            // Leer cuerpo de la petición
            InputStream is = exchange.getRequestBody();
            Scanner scanner = new Scanner(is, "UTF-8").useDelimiter("\\A");
            String body = scanner.hasNext() ? scanner.next() : "";

            // Simular el Request de API Gateway
            APIGatewayProxyRequestEvent requestEvent = new APIGatewayProxyRequestEvent();
            requestEvent.setHttpMethod(exchange.getRequestMethod());
            requestEvent.setPath(exchange.getRequestURI().getPath());
            requestEvent.setBody(body);

            // Invocar el Handler real (Reutilizamos el mockContext de TestLocal)
            APIGatewayProxyResponseEvent responseEvent = handler.handleRequest(requestEvent, TestLocal.mockContext);

            // Devolver la respuesta
            enviarRespuesta(exchange, responseEvent.getStatusCode(), responseEvent.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            enviarRespuesta(exchange, 500, "{\"error\": \"Error interno del servidor local\"}");
        }
    }

    private static void enviarRespuesta(HttpExchange exchange, int statusCode, String body) {
        try {
            byte[] bytes = body != null ? body.getBytes("UTF-8") : new byte[0];
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(statusCode, bytes.length == 0 ? -1 : bytes.length);
            
            if (bytes.length > 0) {
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
