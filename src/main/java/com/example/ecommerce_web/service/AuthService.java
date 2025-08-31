package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ================= QUÊN MẬT KHẨU (OTP) =================

    // Gửi OTP
    public void sendResetOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        String subject = "Mã OTP đặt lại mật khẩu";
        String htmlBody = "<p>Xin chào <b>" + user.getUsername() + "</b>,</p>"
                + "<p>Mã OTP của bạn là: <b>" + otp + "</b></p>"
                + "<p>OTP sẽ hết hạn sau <b>5 phút</b>.</p>";

        emailService.sendHtmlEmail(user.getEmail(), subject, htmlBody);
    }

    // Xác thực OTP
    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        return user.getResetOtp() != null
                && user.getResetOtp().equals(otp)
                && user.getResetOtpExpiry().isAfter(LocalDateTime.now());
    }

    // Reset mật khẩu bằng OTP
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        if (user.getResetOtp() == null
                || !user.getResetOtp().equals(otp)
                || user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP sai hoặc đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);
    }

    // ================= ĐỔI MẬT KHẨU =================
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với email: " + email));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }

        // Kiểm tra độ mạnh mật khẩu
        String passwordPattern = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-\\[\\]{};:'\"\\,.<>?/]).{8,}$";
        if (!newPassword.matches(passwordPattern)) {
            throw new RuntimeException("Mật khẩu mới phải ít nhất 8 ký tự, có số và ký tự đặc biệt");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        String subject = "Xác nhận đổi mật khẩu";
        String htmlBody = "<p>Xin chào <b>" + user.getUsername() + "</b>,</p>"
                + "<p>Bạn vừa đổi mật khẩu thành công lúc <b>" + LocalDateTime.now() + "</b>.</p>"
                + "<p>Nếu không phải bạn, vui lòng liên hệ hỗ trợ ngay.</p>";

        emailService.sendHtmlEmail(user.getEmail(), subject, htmlBody);
    }
}
