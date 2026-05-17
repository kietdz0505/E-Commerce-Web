import React, { useState } from "react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import {
  getOAuthUrl,
  getApiUrl,
} from "../config/apiConfig";
import PasswordRecovery from "../pages/user/PasswordRecovery";
import "../styles/loginPopup.css";

function LoginPopup({
  open,
  onClose,
  onSwitchToRegister,
}) {
  const [formData, setFormData] =
    useState({
      username: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showForgot, setShowForgot] =
    useState(false);

  const handleLoginSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      // ================= LOGIN =================
      const res = await fetch(
        getOAuthUrl("local"),
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username:
              formData.username.trim(),
            password:
              formData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Sai tài khoản hoặc mật khẩu!"
        );
      }

      // ================= TOKENS =================
      const accessToken =
        data?.data?.accessToken;

      const refreshToken =
        data?.data?.refreshToken;

      if (!accessToken) {
        throw new Error(
          "Không nhận được access token!"
        );
      }

      // save tokens
      localStorage.setItem(
        "token",
        accessToken
      );

      if (refreshToken) {
        localStorage.setItem(
          "refreshToken",
          refreshToken
        );
      }

      // ================= PROFILE =================
      const profileRes =
        await fetch(
          getApiUrl("PROFILE"),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

      const profileData =
        await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(
          profileData?.message ||
            "Không lấy được thông tin user!"
        );
      }

      // backend có thể wrap ApiResponse
      const currentUser =
        profileData?.data ||
        profileData;

      localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );

      // ================= ROLE =================
      const roles =
        currentUser?.roles || [];

      const isAdmin =
        roles.includes("ROLE_ADMIN");

      // ================= REDIRECT =================
      window.location.href =
        isAdmin
          ? "/admin"
          : "/";

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Đăng nhập thất bại!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="az-modal-overlay"
      onClick={onClose}
    >
      <div
        className="az-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="az-modal-header">
          <h2>
            {showForgot
              ? "Khôi phục mật khẩu"
              : "Đăng nhập"}
          </h2>

          <button onClick={onClose}>
            ×
          </button>
        </div>

        {!showForgot ? (
          <>
            {/* FORM */}
            <form
              className="az-form"
              onSubmit={
                handleLoginSubmit
              }
            >
              <input
                type="text"
                placeholder="Email hoặc username"
                value={
                  formData.username
                }
                onChange={(e) =>
                  setFormData(
                    (prev) => ({
                      ...prev,
                      username:
                        e.target.value,
                    })
                  )
                }
                disabled={
                  isSubmitting
                }
                required
              />

              <input
                type="password"
                placeholder="Mật khẩu"
                value={
                  formData.password
                }
                onChange={(e) =>
                  setFormData(
                    (prev) => ({
                      ...prev,
                      password:
                        e.target.value,
                    })
                  )
                }
                disabled={
                  isSubmitting
                }
                required
              />

              {error && (
                <div className="az-error-text">
                  {error}
                </div>
              )}

              <button
                className="az-submit"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting
                  ? "Đang đăng nhập..."
                  : "Đăng nhập"}
              </button>
            </form>

            {/* ACTION */}
            <div className="az-forgot">
              <span
                onClick={() =>
                  setShowForgot(
                    true
                  )
                }
              >
                Quên mật khẩu?
              </span>
            </div>

            <div className="az-switch">
              Chưa có tài khoản?
              <span
                onClick={
                  onSwitchToRegister
                }
              >
                {" "}
                Đăng ký
              </span>
            </div>

            {/* DIVIDER */}
            <div className="az-divider">
              Hoặc
            </div>

            {/* SOCIAL */}
            <div className="az-social">
              <a
                href={getOAuthUrl(
                  "google"
                )}
              >
                <FaGoogle />
                Google
              </a>

              <a
                href={getOAuthUrl(
                  "facebook"
                )}
              >
                <FaFacebookF />
                Facebook
              </a>
            </div>
          </>
        ) : (
          <PasswordRecovery
            onBackToLogin={() =>
              setShowForgot(false)
            }
          />
        )}
      </div>
    </div>
  );
}

export default LoginPopup;