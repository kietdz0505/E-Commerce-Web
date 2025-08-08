package com.example.ecommerce_web.service.impl;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.repository.OrderRepository;
import com.example.ecommerce_web.repository.OrderItemRepository;
import com.example.ecommerce_web.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.ecommerce_web.model.Order;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Long getTotalOrders() {
        return orderRepository.count();
    }

    @Override
    public Double getTotalRevenue() {
        return orderRepository.findAll()
                .stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();
    }

    @Override
    public List<ProductDTO> getTopSellingProducts() {
        return orderItemRepository.findTopSellingProducts()
                .stream()
                .map(item -> {
                    ProductDTO dto = new ProductDTO();
                    dto.setId(item.getProduct().getId());
                    dto.setName(item.getProduct().getName());
                    dto.setPrice(item.getProduct().getPrice());
                    dto.setImageUrl(item.getProduct().getImageUrl());
                    dto.setStock(item.getProduct().getStock());
                    dto.setAvailable(item.getProduct().isAvailable());
                    dto.setBrandId(item.getProduct().getBrand().getId());
                    dto.setBrandName(item.getProduct().getBrand().getName());
                    dto.setCategoryId(item.getProduct().getCategory().getId());
                    dto.setCategoryName(item.getProduct().getCategory().getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
