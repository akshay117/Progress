package com.wecaare.insurance.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class InsuranceRecordRequest {
    private String customerName;
    private String phoneNumber;
    private String vehicleNumber;
    private String company;
    private LocalDate policyStartDate;
    private LocalDate expiryDate;
}

