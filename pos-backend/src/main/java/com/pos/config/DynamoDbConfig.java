package com.pos.config;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.net.URI;

public class DynamoDbConfig {

    private static DynamoDbClient instance;

    public static synchronized DynamoDbClient getClient() {
        if (instance == null) {
            String modoLocal = System.getProperty("IS_LOCAL", System.getenv("IS_LOCAL"));
            
            if ("true".equals(modoLocal)) {
                System.out.println("[DynamoDbConfig] Modo LOCAL -> conectando a http://localhost:8000");
                instance = DynamoDbClient.builder()
                        .endpointOverride(URI.create("http://localhost:8000"))
                        .region(Region.US_EAST_1)
                        .credentialsProvider(StaticCredentialsProvider.create(
                                AwsBasicCredentials.create("dummy", "dummy")))
                        .build();
            } else {
                System.out.println("[DynamoDbConfig] Modo NUBE -> conectando a AWS DynamoDB real");
                instance = DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .build();
            }
        }
        return instance;
    }
}
