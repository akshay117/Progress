package com.wecaare.insurance.service;

import com.wecaare.insurance.repository.InsuranceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final InsuranceRecordRepository recordRepository;
    
    private static final String[] MONTH_NAMES = {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };
    
    public Map<String, Object> getMonthlyPerformance(int year) {
        List<Object[]> data = recordRepository.countByYearAndMonth(year);
        
        Map<Integer, Long> monthlyData = new HashMap<>();
        for (Object[] row : data) {
            Integer month = (Integer) row[0];
            Long count = (Long) row[1];
            monthlyData.put(month, count);
        }
        
        // Create array of monthly data in the format frontend expects
        List<Map<String, Object>> performanceData = new ArrayList<>();
        long totalPolicies = 0;
        
        for (int month = 1; month <= 12; month++) {
            long policies = monthlyData.getOrDefault(month, 0L);
            totalPolicies += policies;
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", MONTH_NAMES[month - 1]);
            monthData.put("policies", policies);
            monthData.put("revenue", policies * 5000); // Dummy revenue calculation
            performanceData.add(monthData);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("data", performanceData);
        result.put("totalPolicies", totalPolicies);
        return result;
    }
    
    public long getPoliciesCount() {
        return recordRepository.countByDeletedAtIsNull();
    }
}

