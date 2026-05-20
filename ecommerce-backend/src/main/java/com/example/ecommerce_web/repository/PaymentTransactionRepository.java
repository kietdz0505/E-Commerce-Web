package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.PaymentTransaction;
import com.example.ecommerce_web.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTxnRef(String txnRef);

}