package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.ProductDTO;
import java.util.List;

public interface ReportService {
    Long getTotalOrders();
    Double getTotalRevenue();
    List<ProductDTO> getTopSellingProducts();
}
