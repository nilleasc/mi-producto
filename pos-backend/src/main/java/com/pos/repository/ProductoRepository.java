package com.pos.repository;

import com.pos.config.DynamoDbConfig;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProductoRepository {

    private final DynamoDbClient dynamoDb;

    public ProductoRepository() {
        this.dynamoDb = DynamoDbConfig.getClient();
    }

    public List<Map<String, Object>> obtenerProductosDeDynamo() {
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
        
        return productos;
    }
}
