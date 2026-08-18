package com.adelevate.controllers;

import com.adelevate.clients.LoggerClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logger-test")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class LoggerTestController {

    private final LoggerClient loggerClient;

    @GetMapping
    public ResponseEntity<String> testLogger() {
        loggerClient.sendLog("SpringBootBackend", "INFO", "TEST_PING", "Direct test log from LoggerTestController", "USER_100");
        return ResponseEntity.ok("✅ Test log sent successfully to MS.NET Logger Microservice (Port 5050)!");
    }
}
