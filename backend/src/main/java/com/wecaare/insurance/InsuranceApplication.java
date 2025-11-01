package com.wecaare.insurance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class InsuranceApplication {
    
    public static void main(String[] args) {
        System.out.println("=".repeat(50));
        System.out.println("🚀 WeCare Insurance API Server (Spring Boot)");
        System.out.println("=".repeat(50));
        
        SpringApplication.run(InsuranceApplication.class, args);
        
        System.out.println("=".repeat(50));
        System.out.println("✅ Server started successfully!");
        System.out.println("📊 API Context: /api");
        System.out.println("=".repeat(50));
    }
}

