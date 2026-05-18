package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.Order;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.PaymentMethod;
import com.example.ecommerce_web.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupService {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Scheduled(fixedRate = 60000)
    public void cancelExpiredOrders() {

        LocalDateTime expiredTime =
                LocalDateTime.now()
                        .minusMinutes(15);

        List<Order> expiredOrders =
                orderRepository
                        .findByStatusAndOrderDateBefore(
                                OrderStatus.PENDING,
                                expiredTime
                        );

        for (Order order : expiredOrders) {

            try {

                // =================================================
                // CHỈ AUTO CANCEL PAYMENT ONLINE
                // =================================================
                if (
                        order.getPaymentMethod()
                                == PaymentMethod.CASH
                ) {
                    continue;
                }

                orderService.updateOrderStatus(
                        order.getId(),
                        OrderStatus.FAILED
                );

                log.info(
                        "Expired order cancelled: {}",
                        order.getId()
                );

            } catch (Exception e) {

                log.error(
                        "Failed to cancel order {}",
                        order.getId(),
                        e
                );
            }
        }
    }
}