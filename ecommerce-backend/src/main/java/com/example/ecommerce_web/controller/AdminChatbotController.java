package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ChatbotContentDTO;
import com.example.ecommerce_web.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/chatbot")
@PreAuthorize("hasRole('ADMIN')")
public class AdminChatbotController {

    private final ChatbotService chatbotService;

    public AdminChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    // Thêm nội dung chatbot
    @PostMapping
    public ResponseEntity<ChatbotContentDTO> addContent(@RequestBody ChatbotContentDTO dto) {
        ChatbotContentDTO createdContent = chatbotService.addContent(dto);
        return ResponseEntity.ok(createdContent);
    }

    // Sửa nội dung chatbot
    @PutMapping("/{id}")
    public ResponseEntity<ChatbotContentDTO> updateContent(
            @PathVariable Long id,
            @RequestBody ChatbotContentDTO dto
    ) {
        ChatbotContentDTO updatedContent = chatbotService.updateContent(id, dto);
        if (updatedContent != null) {
            return ResponseEntity.ok(updatedContent);
        }
        return ResponseEntity.notFound().build();
    }

    // Lấy danh sách nội dung chatbot
    @GetMapping
    public ResponseEntity<List<ChatbotContentDTO>> getAllContents() {
        return ResponseEntity.ok(chatbotService.getAllContents());
    }

    // Xóa nội dung chatbot
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        boolean deleted = chatbotService.deleteContent(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
