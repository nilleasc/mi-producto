package com.pos.repository;

import com.pos.config.DynamoDbConfig;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.Map;

public class VentaRepository implements IVentaRepository {

    private final DynamoDbClient dynamoDb;

    public VentaRepository() {
        this.dynamoDb = DynamoDbConfig.getClient();
    }

    public void guardarVenta(Map<String, AttributeValue> itemValues) {
        dynamoDb.putItem(PutItemRequest.builder()
                .tableName("ventas")
                .item(itemValues)
                .build());
    }
}
