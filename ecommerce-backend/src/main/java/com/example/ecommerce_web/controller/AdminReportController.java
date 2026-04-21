package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/report")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping("/overview")
    public Map<String, Object> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "5") Integer limit,
            @RequestParam(defaultValue = "50") Integer lowStockThreshold
    ) {
        if (start == null) {
            start = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
        }
        if (end == null) {
            end = LocalDateTime.now();
        }

        // Lấy dữ liệu tổng quan + tổng tồn kho từ service
        Map<String, Object> overview = reportService.getOverview(start, end, limit, lowStockThreshold);

        return overview;
    }


}
