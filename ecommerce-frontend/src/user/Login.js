import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { getOAuthUrl } from "../config/apiConfig";


const Login = () => {
  const handleSuccess = (credentialResponse) => {
    window.location.href = getOAuthUrl('google');
  };

  return (
    <GoogleOAuthProvider clientId="795276792020-k8vt8rfc44l6t65th0e0or9vets85u1g.apps.googleusercontent.com">
      <div className="d-flex flex-column align-items-center mt-5">
        <h2>Đăng nhập với Google</h2>
        <button className="btn btn-danger mt-3" onClick={handleSuccess}>
          Login with Google
        </button>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
