package com.example.ecommerce_web.service;

import com.example.ecommerce_web.repository.OrderRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public Map<String, Object> getOverview(LocalDateTime start, LocalDateTime end, Integer limit, int lowStockThreshold) {
        Map<String, Object> result = new HashMap<>();

        // Tổng đơn & doanh thu
        result.put("totalOrders", orderRepository.countCompletedOrdersInRange(start, end));
        result.put("totalRevenue", orderRepository.getTotalRevenueInRange(start, end));

        // Top sản phẩm bán chạy
        List<Object[]> topProducts = orderRepository.getTopSellingProductsInRange(start, end);
        if (limit != null && limit > 0 && limit < topProducts.size()) {
            topProducts = topProducts.subList(0, limit);
        }
        result.put("topProducts", mapTopProducts(topProducts));

        // Sản phẩm tồn kho thấp
        result.put("lowStock", orderRepository.findLowStockProducts(lowStockThreshold)
                .stream()
                .map(p -> Map.of("id", p.getId(), "name", p.getName(), "stock", p.getStock()))
                .toList());

        // Thêm tổng số lượng hàng tồn
        result.put("totalStockQuantity", productRepository.sumAllStock());

        return result;
    }


    private List<Map<String, Object>> mapTopProducts(List<Object[]> data) {
        return data.stream()
                .map(obj -> Map.of("name", obj[0], "totalSold", obj[1]))
                .toList();
    }

    public int getTotalStockQuantity() {
        return productRepository.sumAllStock();
    }

}
