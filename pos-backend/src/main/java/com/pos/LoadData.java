package com.pos;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LoadData {
    public static void main(String[] args) {
        System.out.println("Iniciando carga de datos en DynamoDB Local...");

        DynamoDbClient dynamoDb = DynamoDbClient.builder()
                .endpointOverride(URI.create("http://localhost:8000"))
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create("dummy", "dummy")))
                .build();

        try {
            InputStream is = LoadData.class.getClassLoader().getResourceAsStream("productos.json");
            if (is == null) {
                System.out.println("❌ No se encontró productos.json");
                return;
            }
            
            String jsonContenido = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            Gson gson = new Gson();
            List<Map<String, Object>> productos = gson.fromJson(jsonContenido, new TypeToken<List<Map<String, Object>>>(){}.getType());

            int cargados = 0;
            for (Map<String, Object> p : productos) {
                Map<String, AttributeValue> item = new HashMap<>();
                item.put("productoId", AttributeValue.builder().s(String.valueOf(p.get("id"))).build());
                item.put("sku", AttributeValue.builder().s(String.valueOf(p.get("sku"))).build());
                item.put("nombre", AttributeValue.builder().s(String.valueOf(p.get("name"))).build());
                
                Map<String, Object> price = (Map<String, Object>) p.get("price");
                item.put("precio", AttributeValue.builder().n(String.valueOf(((Double) price.get("amount")).intValue())).build());
                item.put("moneda", AttributeValue.builder().s(String.valueOf(price.get("currency"))).build());
                item.put("stock", AttributeValue.builder().n(String.valueOf(((Double) p.get("stock")).intValue())).build());
                item.put("categoria", AttributeValue.builder().s(String.valueOf(p.get("categoryId"))).build());
                item.put("activo", AttributeValue.builder().bool((Boolean) p.get("isActive")).build());

                dynamoDb.putItem(PutItemRequest.builder().tableName("productos").item(item).build());
                System.out.println("✅ " + p.get("name"));
                cargados++;
            }
            System.out.println("🎉 Total cargados correctamente con UTF-8: " + cargados);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
