package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Đếm số đơn hoàn thành trong khoảng thời gian
    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :start AND :end")
    Long countCompletedOrdersInRange(@Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);

    // Tổng doanh thu trong khoảng thời gian
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
            "WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :start AND :end")
    BigDecimal getTotalRevenueInRange(@Param("start") LocalDateTime start,
                                      @Param("end") LocalDateTime end);

    // Top sản phẩm bán chạy
    @Query("SELECT p.name, SUM(oi.quantity) AS totalSold " +
            "FROM Order o JOIN o.items oi JOIN oi.product p " +
            "WHERE o.status = 'COMPLETED' AND o.orderDate BETWEEN :start AND :end " +
            "GROUP BY p.name ORDER BY totalSold DESC")
    List<Object[]> getTopSellingProductsInRange(@Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    @Query("SELECT p FROM Product p WHERE p.stock <= :threshold ORDER BY p.stock ASC")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);


    // Lấy danh sách đơn hàng theo User ID (chú ý User_Id)
    Page<Order> findByUser_Id(String userId, Pageable pageable);

    Optional<Order> findByIdAndUserId(Long id, String userId);

}
