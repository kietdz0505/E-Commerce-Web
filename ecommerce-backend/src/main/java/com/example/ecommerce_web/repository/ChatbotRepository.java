package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.ChatbotQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotRepository extends JpaRepository<ChatbotQuestion, Long> {

    // Tìm câu hỏi chứa từ khóa (không phân biệt hoa thường)
    List<ChatbotQuestion> findByQuestionContainingIgnoreCase(String keyword);
}
