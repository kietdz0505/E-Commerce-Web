package com.example.ecommerce_web.mapper;

import com.example.ecommerce_web.dto.ReviewDTO;
import com.example.ecommerce_web.model.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewDTO toDTO(
            Review review,
            String currentUserId
    ) {

        if (review == null) return null;

        ReviewDTO dto = new ReviewDTO();

        dto.setId(review.getId());
        dto.setComment(review.getComment());
        dto.setRating(review.getRating());
        dto.setImageUrl(review.getImageUrl());
        dto.setCreatedAt(review.getCreatedAt());

        if (review.getUser() != null) {

            dto.setUserName(
                    review.getUser().getName()
            );

            dto.setUserAvatar(
                    review.getUser().getPicture()
            );

            dto.setOwner(
                    currentUserId != null &&
                            review.getUser()
                                    .getId()
                                    .equals(currentUserId)
            );
        }

        return dto;
    }
}