package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.repository.UserPromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
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
        if (user == null) {
            log.warn("User not found with email: {}", email);
            return false;
        }

        // Kiểm tra user đã nhận promotion chưa
        if (hasUserPromotion(user, promotion)) {
            log.info("User {} đã nhận promotion {} rồi", email, promotion.getCode());
            return false; // hoặc ném exception nếu muốn báo lỗi rõ hơn
        }

        sendPromotion(user, promotion, baseUrl);
        return true;
    }

    public void save(UserPromotion userPromotion) {
        userPromotionRepository.save(userPromotion);
    }

    public boolean hasUserPromotion(User user, Promotion promotion) {
        return userPromotionRepository.existsByUserAndPromotion(user, promotion);
    }

    public Optional<UserPromotion> getUserPromotion(UserPromotionId id) {
        return userPromotionRepository.findById(id);
    }


    /**
     * Gửi khuyến mãi cho tất cả user
     */
    public void sendPromotionToAllUsers(Promotion promotion, String baseUrl) {
        List<User> users = userService.getAllUsersEntity();

        for (User user : users) {
            // Kiểm tra user đã nhận promotion này chưa
            if (hasUserPromotion(user, promotion)) {  // <-- gọi trực tiếp method
                continue;
            }

            try {
                sendPromotion(user, promotion, baseUrl);
            } catch (Exception e) {
                log.error("Cannot send promotion to user: " + user.getEmail(), e);
            }
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

        // Kiểm tra trạng thái đã nhận hay chưa
        boolean alreadyClaimed = userPromotionRepository.findById(
                        new UserPromotionId(user.getId(), promotion.getId()))
                .map(up -> up.getStatus() == PromotionStatus.CLICKED)
                .orElse(false);

        // Tạo HTML cho nút
        String buttonHtml;
        if (alreadyClaimed) {
            buttonHtml = "<button style='padding:10px 20px;background-color:gray;color:white;"
                    + "border:none;border-radius:5px;' disabled>Đã nhận</button>";
        } else {
            buttonHtml = "<a href='" + claimUrl + "' style='display:inline-block;padding:10px 20px;"
                    + "background-color:#28a745;color:white;text-decoration:none;"
                    + "border-radius:5px;font-weight:bold;'>CLAIM NOW!</a>";
        }

        // Lưu record nếu chưa gửi
        if (!alreadyClaimed) {
            saveUserPromotion(user, promotion, PromotionStatus.SENT);
        }

        // Tạo nội dung email
        String subject = "Khuyến mãi mới: " + promotion.getCode();
        String body = "<p>Xin chào " + user.getName() + ",</p>"
                + "<p>Chúng tôi vừa ra mắt chương trình khuyến mãi: " + promotion.getDescription() + "</p>"
                + "<p>Giảm giá: " + promotion.getDiscountPercent() + "%</p>"
                + "<p>Thời gian áp dụng: " + promotion.getValidFrom() + " đến " + promotion.getValidTo() + "</p>"
                + "<p>" + buttonHtml + "</p>";

        // Gửi email HTML
        emailService.sendHtmlEmail(user.getEmail(), subject, body);
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
