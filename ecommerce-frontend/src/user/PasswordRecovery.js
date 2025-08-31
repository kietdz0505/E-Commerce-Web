import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { API_CONFIG } from "../config/apiConfig";

function PasswordRecovery({ onBackToLogin }) {
  const [step, setStep] = useState("email"); // email | otp | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Gửi email để lấy OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await apiClient.post(API_CONFIG.API.FORGOT_PASSWORD, { email });
      setMessage({ type: "success", text: "✅ Vui lòng kiểm tra email để lấy mã OTP." });
      setStep("otp");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "❌ Email không tồn tại trong hệ thống!",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xác minh OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await apiClient.post(API_CONFIG.API.VERIFY_OTP, { email, otp });
      setMessage({ type: "success", text: "✅ OTP chính xác!" });
      setStep("reset");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "❌ OTP không hợp lệ!",
      });
    } finally {
      setLoading(false);
    }
  };

  // Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage({ type: "error", text: "❌ Mật khẩu không khớp!" });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await apiClient.post(API_CONFIG.API.RESET_PASSWORD, {
        email,
        otp,               // lấy từ input OTP
        newPassword: password,
        confirmPassword: confirm
      });

      setMessage({ type: "success", text: "✅ Đặt lại mật khẩu thành công!" });
      setTimeout(() => onBackToLogin(), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "❌ Lỗi khi đặt lại mật khẩu!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Bước 1: Nhập email */}
      {step === "email" && (
        <form className="d-flex flex-column gap-3 mb-2" onSubmit={handleSendOtp}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control rounded-pill px-4"
            placeholder="Nhập email đăng ký"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary rounded-pill fw-bold py-2"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>
      )}

      {/* Bước 2: Nhập OTP */}
      {step === "otp" && (
        <form className="d-flex flex-column gap-3 mb-2" onSubmit={handleVerifyOtp}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="form-control rounded-pill px-4"
            placeholder="Nhập mã OTP"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary rounded-pill fw-bold py-2"
            disabled={loading}
          >
            {loading ? "Đang kiểm tra..." : "Xác nhận OTP"}
          </button>
          <button type="button" className="btn btn-link small" onClick={() => setStep("email")}>
            ← Quay lại nhập email
          </button>
        </form>
      )}

      {/* Bước 3: Đặt lại mật khẩu */}
      {step === "reset" && (
        <form className="d-flex flex-column gap-3 mb-2" onSubmit={handleResetPassword}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control rounded-pill px-4"
            placeholder="Mật khẩu mới"
            required
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="form-control rounded-pill px-4"
            placeholder="Xác nhận mật khẩu"
            required
          />
          <button
            type="submit"
            className="btn btn-success rounded-pill fw-bold py-2"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
          </button>
          <button type="button" className="btn btn-link small" onClick={() => setStep("otp")}>
            ← Quay lại OTP
          </button>
        </form>
      )}

      {/* Thông báo */}
      {message.text && (
        <div
          className={`text-center small mt-2 ${message.type === "success" ? "text-success" : "text-danger"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Quay lại login */}
      <div className="text-center mt-2">
        <button type="button" className="btn btn-link small" onClick={onBackToLogin}>
          ← Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}

export default PasswordRecovery;
