package com.wecaare.insurance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "insurance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String uuid;
    
    // Basic Info (filled by Staff)
    @Column(name = "customer_name")
    private String customerName;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "vehicle_number")
    private String vehicleNumber;
    
    private String company;
    
    @Column(name = "policy_start_date")
    private LocalDate policyStartDate;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    // Financial Info (filled by Admin)
    @Column(name = "total_premium")
    private Double totalPremium;
    
    @Column(name = "total_commission")
    private Double totalCommission;
    
    @Column(name = "customer_discounted_premium")
    private Double customerDiscountedPremium;
    
    // Status fields
    @Column(name = "admin_details_added")
    private Boolean adminDetailsAdded = false;
    
    // Renewal notification tracking
    @Column(name = "renewal_notified")
    private Boolean renewalNotified = false;
    
    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;
    
    @Column(name = "notified_by")
    private Long notifiedBy;
    
    @Column(name = "notified_notes", columnDefinition = "TEXT")
    private String notifiedNotes;
    
    // Audit fields
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @PrePersist
    protected void onCreate() {
        if (uuid == null || uuid.isEmpty()) {
            uuid = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (adminDetailsAdded == null) {
            adminDetailsAdded = false;
        }
        if (renewalNotified == null) {
            renewalNotified = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method to check if financial details are complete
    @Transient
    public boolean hasFinancialDetails() {
        return totalCommission != null && totalCommission > 0;
    }
    
    // Helper method to calculate payout
    @Transient
    public Double calculatePayout() {
        if (totalCommission == null) return 0.0;
        double discount = customerDiscountedPremium != null ? customerDiscountedPremium : 0.0;
        return totalCommission - discount;
    }
}

