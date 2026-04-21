package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ChatbotContentDTO;
import com.example.ecommerce_web.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    // ================= CRUD cho Admin =================

    @PostMapping("/contents")
    public ResponseEntity<ChatbotContentDTO> addContent(@RequestBody ChatbotContentDTO dto) {
        return ResponseEntity.ok(chatbotService.addContent(dto));
    }

    @PutMapping("/contents/{id}")
    public ResponseEntity<ChatbotContentDTO> updateContent(@PathVariable Long id,
                                                           @RequestBody ChatbotContentDTO dto) {
        ChatbotContentDTO updated = chatbotService.updateContent(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/contents/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        boolean deleted = chatbotService.deleteContent(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contents")
    public ResponseEntity<List<ChatbotContentDTO>> getAllContents() {
        return ResponseEntity.ok(chatbotService.getAllContents());
    }

    // ================= API cho User hỏi chatbot =================

    @PostMapping("/ask")
    public ResponseEntity<String> ask(@RequestParam String question) {
        // 1. Ưu tiên tìm chính xác
        Optional<ChatbotContentDTO> exactMatch = chatbotService.findByExactQuestion(question);
        if (exactMatch.isPresent()) {
            return ResponseEntity.ok(exactMatch.get().getAnswer());
        }

        // 2. Nếu không có, tìm gần đúng
        List<ChatbotContentDTO> similarResults = chatbotService.searchByQuestion(question);
        if (!similarResults.isEmpty()) {
            return ResponseEntity.ok(similarResults.get(0).getAnswer());
        }

        // 3. Nếu vẫn không có, trả về câu mặc định
        return ResponseEntity.ok("Xin lỗi, tôi chưa hiểu câu hỏi của bạn. " +
                "Vui lòng thử lại hoặc liên hệ nhân viên hỗ trợ.");
    }


}
