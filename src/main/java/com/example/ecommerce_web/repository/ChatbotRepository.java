package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.ChatbotQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatbotRepository extends JpaRepository<ChatbotQuestion, Long> {
}
