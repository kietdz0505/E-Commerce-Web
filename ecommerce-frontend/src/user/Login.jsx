import React from 'react';
import { getOAuthUrl } from "../config/apiConfig";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = getOAuthUrl('google');
  };

  const handleFacebookLogin = () => {
    window.location.href = getOAuthUrl('facebook');
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <h2>Đăng nhập</h2>
      <button className="btn btn-danger mt-3" onClick={handleGoogleLogin}>
        Đăng nhập với Google
      </button>
      <button className="btn btn-primary mt-3" onClick={handleFacebookLogin}>
        Đăng nhập với Facebook
      </button>
    </div>
  );
};

export default Login;
