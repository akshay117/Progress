package com.wecaare.insurance.service;

import com.wecaare.insurance.dto.FinancialDetailsRequest;
import com.wecaare.insurance.dto.InsuranceRecordRequest;
import com.wecaare.insurance.model.InsuranceRecord;
import com.wecaare.insurance.repository.InsuranceRecordRepository;
import com.wecaare.insurance.security.UserDetailsImpl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsuranceRecordService {
    
    private final InsuranceRecordRepository recordRepository;
    @PersistenceContext
    private EntityManager entityManager;
    
    private Long getCurrentUserId() {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                throw new RuntimeException("User not authenticated");
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get current user: " + e.getMessage());
        }
    }
    
    @Transactional
    public InsuranceRecord createRecord(InsuranceRecordRequest request) {
        // Generate UUID first
        String uuid = UUID.randomUUID().toString();
        Long userId = getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();
        
        // Format datetime as string in SQLite-compatible format: "YYYY-MM-DD HH:MM:SS"
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String nowStr = now.format(formatter);
        
        // Use native query for SQLite compatibility
        String sql = "INSERT INTO insurance_records (" +
            "uuid, customer_name, phone_number, vehicle_number, company, " +
            "policy_start_date, expiry_date, created_by, updated_by, " +
            "created_at, updated_at, admin_details_added, renewal_notified" +
            ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        entityManager.createNativeQuery(sql)
            .setParameter(1, uuid)
            .setParameter(2, request.getCustomerName())
            .setParameter(3, request.getPhoneNumber())
            .setParameter(4, request.getVehicleNumber())
            .setParameter(5, request.getCompany())
            .setParameter(6, request.getPolicyStartDate())
            .setParameter(7, request.getExpiryDate())
            .setParameter(8, userId)
            .setParameter(9, userId)
            .setParameter(10, nowStr)
            .setParameter(11, nowStr)
            .setParameter(12, false)
            .setParameter(13, false)
            .executeUpdate();
        
        entityManager.flush();
        
        // Query back by UUID to get the record with generated ID
        return recordRepository.findByUuid(uuid)
            .orElseThrow(() -> new RuntimeException("Failed to retrieve created record"));
    }
    
    public List<InsuranceRecord> getAllRecords() {
        return recordRepository.findByDeletedAtIsNullOrderByUpdatedAtDesc();
    }
    
    public List<InsuranceRecord> searchRecords(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllRecords();
        }
        return recordRepository.searchRecords(search.trim());
    }
    
    public InsuranceRecord getRecordById(Long id) {
        return recordRepository.findById(id)
            .filter(record -> record.getDeletedAt() == null)
            .orElseThrow(() -> new RuntimeException("Record not found"));
    }
    
    @Transactional
    public InsuranceRecord updateRecord(Long id, InsuranceRecordRequest request) {
        InsuranceRecord record = getRecordById(id);
        record.setCustomerName(request.getCustomerName());
        record.setPhoneNumber(request.getPhoneNumber());
        record.setVehicleNumber(request.getVehicleNumber());
        record.setCompany(request.getCompany());
        record.setPolicyStartDate(request.getPolicyStartDate());
        record.setExpiryDate(request.getExpiryDate());
        record.setUpdatedBy(getCurrentUserId());
        
        return recordRepository.save(record);
    }
    
    @Transactional
    public void deleteRecord(Long id) {
        InsuranceRecord record = getRecordById(id);
        record.setDeletedAt(LocalDateTime.now());
        record.setUpdatedBy(getCurrentUserId());
        recordRepository.save(record);
    }
    
    @Transactional
    public InsuranceRecord updateFinancials(Long id, FinancialDetailsRequest request) {
        InsuranceRecord record = getRecordById(id);
        record.setTotalPremium(request.getTotalPremium());
        record.setTotalCommission(request.getTotalCommission());
        record.setCustomerDiscountedPremium(request.getCustomerDiscountedPremium());
        record.setAdminDetailsAdded(request.getTotalCommission() != null && request.getTotalCommission() > 0);
        record.setUpdatedBy(getCurrentUserId());
        
        return recordRepository.save(record);
    }
    
    public List<Map<String, Object>> getExpiringPolicies(Integer days) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(days != null ? days : 30);
        
        // Convert to String for native query
        String startDateStr = today.toString();
        String endDateStr = futureDate.toString();
        
        List<InsuranceRecord> records = recordRepository.findExpiringPolicies(startDateStr, endDateStr);
        
        return records.stream().map(record -> {
            Map<String, Object> result = new HashMap<>();
            result.put("id", record.getId());
            result.put("uuid", record.getUuid());
            result.put("customerName", record.getCustomerName());
            result.put("phoneNumber", record.getPhoneNumber());
            result.put("vehicleNumber", record.getVehicleNumber());
            result.put("company", record.getCompany());
            result.put("expiryDate", record.getExpiryDate());
            result.put("renewalNotified", record.getRenewalNotified());
            result.put("notifiedAt", record.getNotifiedAt());
            
            long daysUntilExpiry = ChronoUnit.DAYS.between(today, record.getExpiryDate());
            result.put("daysUntilExpiry", daysUntilExpiry);
            
            String urgency = daysUntilExpiry <= 7 ? "high" : daysUntilExpiry <= 15 ? "medium" : "low";
            result.put("urgency", urgency);
            
            return result;
        }).collect(Collectors.toList());
    }
    
    @Transactional
    public InsuranceRecord markAsNotified(Long id, String notes) {
        InsuranceRecord record = getRecordById(id);
        record.setRenewalNotified(true);
        record.setNotifiedAt(LocalDateTime.now());
        record.setNotifiedBy(getCurrentUserId());
        record.setNotifiedNotes(notes);
        record.setUpdatedBy(getCurrentUserId());
        
        return recordRepository.save(record);
    }
    
    @Transactional
    public InsuranceRecord unmarkAsNotified(Long id) {
        InsuranceRecord record = getRecordById(id);
        record.setRenewalNotified(false);
        record.setNotifiedAt(null);
        record.setNotifiedBy(null);
        record.setNotifiedNotes(null);
        record.setUpdatedBy(getCurrentUserId());
        
        return recordRepository.save(record);
    }
    
    public long getTotalRecordsCount() {
        return recordRepository.countByDeletedAtIsNull();
    }
    
    public Map<String, Object> getFinancialSummary() {
        List<InsuranceRecord> records = getAllRecords();
        
        double totalRevenue = records.stream()
            .filter(r -> r.getTotalPremium() != null)
            .mapToDouble(InsuranceRecord::getTotalPremium)
            .sum();
        
        long completedCount = records.stream()
            .filter(InsuranceRecord::hasFinancialDetails)
            .count();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("completedRecords", completedCount);
        summary.put("totalRecords", records.size());
        summary.put("pendingRecords", records.size() - completedCount);
        
        return summary;
    }
}

