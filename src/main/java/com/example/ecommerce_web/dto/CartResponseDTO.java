package com.example.ecommerce_web.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartResponseDTO {
    private Long id;
    private UserDTO user;
    private List<CartItemDTO> items;
}
