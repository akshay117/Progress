package com.wecaare.insurance.controller;

import com.wecaare.insurance.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Year;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    @GetMapping("/monthly-performance")
    public ResponseEntity<Map<String, Object>> getMonthlyPerformance(
            @RequestParam(defaultValue = "#{T(java.time.Year).now().getValue()}") int year) {
        
        Map<String, Object> data = analyticsService.getMonthlyPerformance(year);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/policies-count")
    public ResponseEntity<Map<String, Object>> getPoliciesCount() {
        long count = analyticsService.getPoliciesCount();
        return ResponseEntity.ok(Map.of("totalPolicies", count));
    }
}

