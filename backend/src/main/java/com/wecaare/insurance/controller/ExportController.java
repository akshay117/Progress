package com.wecaare.insurance.controller;

import com.wecaare.insurance.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ExportController {
    
    private final ExportService exportService;
    
    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportToExcel() throws IOException {
        byte[] excelData = exportService.exportToExcel();
        
        String filename = "WeCare_Insurance_Records_" + LocalDate.now() + ".xlsx";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(excelData.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
    }
}

