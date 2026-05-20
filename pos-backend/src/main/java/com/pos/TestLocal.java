package com.pos;

import com.amazonaws.services.lambda.runtime.ClientContext;
import com.amazonaws.services.lambda.runtime.CognitoIdentity;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.pos.handlers.CrearVentaHandler;
import com.pos.handlers.ObtenerProductosHandler;

/**
 * Test runner local: invoca los handlers directamente sin SAM CLI.
 * Uso: java -DIS_LOCAL=true -cp target/pos-backend-1.0.0.jar com.pos.TestLocal
 */
public class TestLocal {

    // Implementacion real de LambdaLogger (no es interfaz funcional)
    static class MockLogger implements LambdaLogger {
        public void log(String message) { System.out.println("[LOG] " + message); }
        public void log(byte[] message) { System.out.println("[LOG] " + new String(message)); }
    }

    // Contexto Lambda simulado
    static Context mockContext = new Context() {
        public String getAwsRequestId() { return "test-local-123"; }
        public String getLogGroupName() { return "local"; }
        public String getLogStreamName() { return "local"; }
        public String getFunctionName() { return "TestLocal"; }
        public String getFunctionVersion() { return "local"; }
        public String getInvokedFunctionArn() { return "local"; }
        public CognitoIdentity getIdentity() { return null; }
        public ClientContext getClientContext() { return null; }
        public int getRemainingTimeInMillis() { return 30000; }
        public int getMemoryLimitInMB() { return 512; }
        public LambdaLogger getLogger() { return new MockLogger(); }
    };

    public static void main(String[] args) {
        System.out.println("\n========================================");
        System.out.println("  TEST LOCAL - POS Backend");
        System.out.println("  DynamoDB Local en: http://localhost:8000");
        System.out.println("========================================\n");

        boolean test1 = testGetProductos();
        boolean test2 = testPostVenta();

        System.out.println("\n========================================");
        System.out.println("  RESUMEN:");
        System.out.println("  GET /productos : " + (test1 ? "PASO" : "FALLO"));
        System.out.println("  POST /ventas   : " + (test2 ? "PASO" : "FALLO"));
        System.out.println("========================================\n");
    }

    static boolean testGetProductos() {
        System.out.println("--- TEST 1: GET /productos ---");
        try {
            ObtenerProductosHandler handler = new ObtenerProductosHandler();
            APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
            request.setHttpMethod("GET");
            request.setPath("/productos");

            APIGatewayProxyResponseEvent response = handler.handleRequest(request, mockContext);

            if (response.getStatusCode() == 200) {
                String body = response.getBody();
                System.out.println("RESULTADO : 200 OK");
                System.out.println("MUESTRA   : " + body.substring(0, Math.min(150, body.length())) + "...");
                System.out.println("ESTADO    : PASO\n");
                return true;
            } else {
                System.out.println("RESULTADO : " + response.getStatusCode());
                System.out.println("BODY      : " + response.getBody());
                System.out.println("ESTADO    : FALLO\n");
                return false;
            }
        } catch (Exception e) {
            System.out.println("EXCEPCION : " + e.getMessage());
            System.out.println("ESTADO    : FALLO\n");
            e.printStackTrace();
            return false;
        }
    }

    static boolean testPostVenta() {
        System.out.println("--- TEST 2: POST /ventas ---");
        try {
            CrearVentaHandler handler = new CrearVentaHandler();
            APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
            request.setHttpMethod("POST");
            request.setPath("/ventas");
            request.setBody("{\"total\": 13400, \"cajero\": \"cajero01\", \"items\": [{\"id\":\"1\",\"nombre\":\"Cafe Espresso\",\"cantidad\":2,\"precio\":4500},{\"id\":\"4\",\"nombre\":\"Agua Manantial\",\"cantidad\":1,\"precio\":3200}]}");

            APIGatewayProxyResponseEvent response = handler.handleRequest(request, mockContext);

            if (response.getStatusCode() == 201) {
                System.out.println("RESULTADO : 201 CREATED");
                System.out.println("BODY      : " + response.getBody());
                System.out.println("ESTADO    : PASO\n");
                return true;
            } else {
                System.out.println("RESULTADO : " + response.getStatusCode());
                System.out.println("BODY      : " + response.getBody());
                System.out.println("ESTADO    : FALLO\n");
                return false;
            }
        } catch (Exception e) {
            System.out.println("EXCEPCION : " + e.getMessage());
            System.out.println("ESTADO    : FALLO\n");
            e.printStackTrace();
            return false;
        }
    }
}
