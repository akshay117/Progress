package com.wecaare.insurance.dto;

import lombok.Data;

@Data
public class FinancialDetailsRequest {
    private Double totalPremium;
    private Double totalCommission;
    private Double customerDiscountedPremium;
}

