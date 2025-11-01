package com.wecaare.insurance.controller;

import com.wecaare.insurance.dto.ApiResponse;
import com.wecaare.insurance.dto.FinancialDetailsRequest;
import com.wecaare.insurance.model.InsuranceRecord;
import com.wecaare.insurance.service.InsuranceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final InsuranceRecordService insuranceRecordService;
    
    @PutMapping("/insurance-records/{id}/financials")
    public ResponseEntity<ApiResponse> updateFinancials(
            @PathVariable Long id,
            @RequestBody FinancialDetailsRequest request) {
        
        InsuranceRecord record = insuranceRecordService.updateFinancials(id, request);
        return ResponseEntity.ok(ApiResponse.success("Financial details updated successfully", record));
    }
    
    @GetMapping("/financial-summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        Map<String, Object> summary = insuranceRecordService.getFinancialSummary();
        return ResponseEntity.ok(summary);
    }
}

