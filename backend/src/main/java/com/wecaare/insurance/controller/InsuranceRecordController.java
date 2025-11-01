package com.wecaare.insurance.controller;

import com.wecaare.insurance.dto.ApiResponse;
import com.wecaare.insurance.dto.InsuranceRecordRequest;
import com.wecaare.insurance.model.InsuranceRecord;
import com.wecaare.insurance.service.InsuranceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/insurance-records")
@RequiredArgsConstructor
public class InsuranceRecordController {
    
    private final InsuranceRecordService insuranceRecordService;
    
    @PostMapping
    public ResponseEntity<ApiResponse> createRecord(@RequestBody InsuranceRecordRequest request) {
        InsuranceRecord record = insuranceRecordService.createRecord(request);
        return ResponseEntity.ok(ApiResponse.success("Record created successfully", record));
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRecords(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10000") int limit) {
        
        List<InsuranceRecord> records = search != null && !search.isEmpty() 
            ? insuranceRecordService.searchRecords(search)
            : insuranceRecordService.getAllRecords();
        
        Map<String, Object> response = new HashMap<>();
        response.put("records", records);
        response.put("total", records.size());
        response.put("page", page);
        response.put("limit", limit);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InsuranceRecord> getRecordById(@PathVariable Long id) {
        InsuranceRecord record = insuranceRecordService.getRecordById(id);
        return ResponseEntity.ok(record);
    }
    
    @GetMapping("/expiring")
    public ResponseEntity<Map<String, Object>> getExpiringPolicies(
            @RequestParam(defaultValue = "30") Integer days) {
        
        List<Map<String, Object>> records = insuranceRecordService.getExpiringPolicies(days);
        
        Map<String, Object> response = new HashMap<>();
        response.put("records", records);
        response.put("total", records.size());
        response.put("dateRange", Map.of(
            "days", days
        ));
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateRecord(
            @PathVariable Long id,
            @RequestBody InsuranceRecordRequest request) {
        
        InsuranceRecord record = insuranceRecordService.updateRecord(id, request);
        return ResponseEntity.ok(ApiResponse.success("Record updated successfully", record));
    }
    
    @PutMapping("/{id}/notify")
    public ResponseEntity<ApiResponse> markAsNotified(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        
        String notes = body != null ? body.get("notes") : null;
        InsuranceRecord record = insuranceRecordService.markAsNotified(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Policy marked as notified", record));
    }
    
    @PutMapping("/{id}/unnotify")
    public ResponseEntity<ApiResponse> unmarkAsNotified(@PathVariable Long id) {
        InsuranceRecord record = insuranceRecordService.unmarkAsNotified(id);
        return ResponseEntity.ok(ApiResponse.success("Policy marked as pending", record));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteRecord(@PathVariable Long id) {
        insuranceRecordService.deleteRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Record deleted successfully"));
    }
}

