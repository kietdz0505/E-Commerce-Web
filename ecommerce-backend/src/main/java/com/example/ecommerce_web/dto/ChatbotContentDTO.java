package com.example.ecommerce_web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotContentDTO {
    private Long id;
    private String question;
    private String answer;
}
