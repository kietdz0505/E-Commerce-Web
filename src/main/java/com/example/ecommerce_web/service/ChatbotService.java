package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.ChatbotContentDTO;
import java.util.List;

public interface ChatbotService {
    ChatbotContentDTO addContent(ChatbotContentDTO dto);
    ChatbotContentDTO updateContent(Long id, ChatbotContentDTO dto);
    boolean deleteContent(Long id);
    List<ChatbotContentDTO> getAllContents();
}
