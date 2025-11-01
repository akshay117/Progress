package com.wecaare.insurance.service;

import com.wecaare.insurance.model.InsuranceRecord;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {
    
    private final InsuranceRecordService insuranceRecordService;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    public byte[] exportToExcel() throws IOException {
        List<InsuranceRecord> records = insuranceRecordService.getAllRecords();
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Insurance Records");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID", "UUID", "Customer Name", "Phone Number", "Vehicle Number",
                "Company", "Policy Start Date", "Policy Expiry Date",
                "Total Premium", "Total Commission", "Customer Discounted Premium",
                "Payout", "Payout Status", "Renewal Notified", "Notified At",
                "Created At", "Updated At"
            };
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows
            int rowNum = 1;
            for (InsuranceRecord record : records) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(record.getId());
                row.createCell(1).setCellValue(record.getUuid());
                row.createCell(2).setCellValue(record.getCustomerName() != null ? record.getCustomerName() : "");
                row.createCell(3).setCellValue(record.getPhoneNumber() != null ? record.getPhoneNumber() : "");
                row.createCell(4).setCellValue(record.getVehicleNumber() != null ? record.getVehicleNumber() : "");
                row.createCell(5).setCellValue(record.getCompany() != null ? record.getCompany() : "");
                row.createCell(6).setCellValue(record.getPolicyStartDate() != null ? record.getPolicyStartDate().format(dateFormatter) : "");
                row.createCell(7).setCellValue(record.getExpiryDate() != null ? record.getExpiryDate().format(dateFormatter) : "");
                row.createCell(8).setCellValue(record.getTotalPremium() != null ? record.getTotalPremium() : 0);
                row.createCell(9).setCellValue(record.getTotalCommission() != null ? record.getTotalCommission() : 0);
                row.createCell(10).setCellValue(record.getCustomerDiscountedPremium() != null ? record.getCustomerDiscountedPremium() : 0);
                row.createCell(11).setCellValue(record.calculatePayout());
                row.createCell(12).setCellValue(record.hasFinancialDetails() ? "Completed" : "Pending");
                row.createCell(13).setCellValue(record.getRenewalNotified() ? "Yes" : "No");
                row.createCell(14).setCellValue(record.getNotifiedAt() != null ? record.getNotifiedAt().toString() : "");
                row.createCell(15).setCellValue(record.getCreatedAt() != null ? record.getCreatedAt().toString() : "");
                row.createCell(16).setCellValue(record.getUpdatedAt() != null ? record.getUpdatedAt().toString() : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
}

