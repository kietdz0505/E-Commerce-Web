package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.repository.UserPromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPromotionService {

    private final UserPromotionRepository userPromotionRepository;
    private final UserService userService;
    private final EmailService emailService;

    /**
     * Gửi khuyến mãi cho 1 user
     */
    public boolean sendPromotionToUserByEmail(String email, Promotion promotion, String baseUrl) {
        User user = userService.findByEmail(email);
        if (user == null) return false;
        sendPromotion(user, promotion, baseUrl);
        return true;
    }

    /**
     * Gửi khuyến mãi cho tất cả user
     */
    public void sendPromotionToAllUsers(Promotion promotion, String baseUrl) {
        List<User> users = userService.getAllUsersEntity();
        for (User user : users) {
            sendPromotion(user, promotion, baseUrl);
        }
    }

    /**
     * Lưu trạng thái khi người dùng bấm vào khuyến mãi
     */
    public void markAsClicked(User user, Promotion promotion) {
        UserPromotionId id = new UserPromotionId(user.getId(), promotion.getId());
        userPromotionRepository.findById(id).ifPresent(up -> {
            up.setClickedAt(LocalDateTime.now());
            up.setStatus(PromotionStatus.CLICKED);
            userPromotionRepository.save(up);
        });
    }

    /**
     * Lấy danh sách khuyến mãi của user
     */
    public List<UserPromotion> getPromotionsForUser(User user) {
        return userPromotionRepository.findByUser(user);
    }

    /**
     * Gửi email + lưu record UserPromotion
     */
    private void sendPromotion(User user, Promotion promotion, String baseUrl) {
        String claimUrl = baseUrl + "/api/promotions/claim?email=" + user.getEmail()
                + "&promotionId=" + promotion.getId();

        // Lưu record
        saveUserPromotion(user, promotion, PromotionStatus.SENT);

        // Gửi email
        String subject = "Khuyến mãi mới: " + promotion.getCode();
        String body = "Xin chào " + user.getName() + ",\n\n" +
                "Chúng tôi vừa ra mắt chương trình khuyến mãi: " + promotion.getDescription() +
                "\nGiảm giá: " + promotion.getDiscountPercent() + "%" +
                "\nThời gian áp dụng: " + promotion.getValidFrom() + " đến " + promotion.getValidTo() +
                "\n\nNhấn vào đây để nhận ngay: " + claimUrl;

        emailService.sendEmail(user.getEmail(), subject, body);
    }

    /**
     * Lưu record vào bảng users_promotions
     */
    private void saveUserPromotion(User user, Promotion promotion, PromotionStatus status) {
        UserPromotionId id = new UserPromotionId(user.getId(), promotion.getId());
        UserPromotion up = new UserPromotion(
                id,
                user,
                promotion,
                status,
                LocalDateTime.now(),
                null,
                null
        );
        userPromotionRepository.save(up);
    }
}
