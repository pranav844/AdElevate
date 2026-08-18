package com.adelevate.clients;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LoggerClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String LOGGER_SERVICE_URL = "http://localhost:5085/api/logs";

    public void sendLog(String serviceName, String logLevel, String action, String message, String userId) {
        System.out.println("🔄 Sending log to .NET Service: [" + action + "] " + message);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> logPayload = new HashMap<>();
            logPayload.put("eventType", action != null ? action : "GENERAL_EVENT");
            logPayload.put("message", message != null ? message : "No message provided");
            logPayload.put("serviceName", serviceName != null ? serviceName : "SpringBootBackend");
            logPayload.put("logLevel", logLevel != null ? logLevel : "INFO");
            logPayload.put("action", action != null ? action : "GENERAL");
            logPayload.put("userId", userId != null ? userId : "GUEST");

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(logPayload, headers);

            restTemplate.postForObject(LOGGER_SERVICE_URL, requestEntity, String.class);
            System.out.println("✅ SUCCESSFULLY SENT log to .NET Logger microservice on port 5085!");
        } catch (Exception e) {
            System.err.println("⚠️ Could not send log to .NET Logger Microservice: " + e.getMessage());
        }
    }
}
