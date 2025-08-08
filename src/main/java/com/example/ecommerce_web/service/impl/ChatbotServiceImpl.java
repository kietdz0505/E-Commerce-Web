package com.example.ecommerce_web.service.impl;

import com.example.ecommerce_web.dto.ChatbotContentDTO;
import com.example.ecommerce_web.model.ChatbotQuestion;
import com.example.ecommerce_web.repository.ChatbotRepository;
import com.example.ecommerce_web.service.ChatbotService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatbotServiceImpl implements ChatbotService {

    private final ChatbotRepository chatbotRepository;

    public ChatbotServiceImpl(ChatbotRepository chatbotRepository) {
        this.chatbotRepository = chatbotRepository;
    }

    @Override
    public ChatbotContentDTO addContent(ChatbotContentDTO dto) {
        ChatbotQuestion entity = new ChatbotQuestion();
        entity.setQuestion(dto.getQuestion());
        entity.setAnswer(dto.getAnswer());
        ChatbotQuestion saved = chatbotRepository.save(entity);
        return new ChatbotContentDTO(saved.getId(), saved.getQuestion(), saved.getAnswer());
    }

    @Override
    public ChatbotContentDTO updateContent(Long id, ChatbotContentDTO dto) {
        return chatbotRepository.findById(id)
                .map(existing -> {
                    existing.setQuestion(dto.getQuestion());
                    existing.setAnswer(dto.getAnswer());
                    ChatbotQuestion updated = chatbotRepository.save(existing);
                    return new ChatbotContentDTO(updated.getId(), updated.getQuestion(), updated.getAnswer());
                })
                .orElse(null);
    }

    @Override
    public boolean deleteContent(Long id) {
        if (chatbotRepository.existsById(id)) {
            chatbotRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<ChatbotContentDTO> getAllContents() {
        return chatbotRepository.findAll()
                .stream()
                .map(q -> new ChatbotContentDTO(q.getId(), q.getQuestion(), q.getAnswer()))
                .collect(Collectors.toList());
    }
}
