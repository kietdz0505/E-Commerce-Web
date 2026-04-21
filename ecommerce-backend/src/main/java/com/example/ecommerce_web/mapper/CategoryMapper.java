package com.example.ecommerce_web.mapper;

import com.example.ecommerce_web.dto.CategoryDTO;
import com.example.ecommerce_web.model.Category;

import java.util.List;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryDTO toCategoryDTO(Category category) {
        return new CategoryDTO(category.getId(), category.getName(), null);
    }

    public static List<CategoryDTO> toCategoryDTOList(List<Category> categories) {
        return categories.stream()
                .map(CategoryMapper::toCategoryDTO)
                .collect(Collectors.toList());
    }
}
