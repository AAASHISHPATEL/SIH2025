import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginSignup.css";
import { useAuth } from "../../auth/AuthContext";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay"; // ✅ adjust path

export default function SignUpSignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, authSubmitting } = useAuth(); // ✅ added authSubmitting

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signinData, setSigninData] = useState({ email: "", password: "" });

  const [signinError, setSigninError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const from = location.state?.from?.pathname || "/NearestARGO";

  useEffect(() => {
    const container = document.getElementById("loginSignup-container");
    const registerBtn = document.getElementById("loginSignup-register");
    const loginBtn = document.getElementById("loginSignup-login");

    if (registerBtn && loginBtn && container) {
      registerBtn.addEventListener("click", () => {
        container.classList.add("active");
      });
      loginBtn.addEventListener("click", () => {
        container.classList.remove("active");
      });
    }

    return () => {
      if (registerBtn) registerBtn.replaceWith(registerBtn.cloneNode(true));
      if (loginBtn) loginBtn.replaceWith(loginBtn.cloneNode(true));
    };
  }, []);

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "", message: "" }), 3000);
  };

  const handleSignup = async () => {
    setSignupError("");
    try {
      await register(signupData);
      showPopup("success", "Signup successful!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Signup failed! Please try again.";
      setSignupError(msg);
      showPopup("error", msg);
    }
  };

  const handleSignin = async () => {
    setSigninError("");
    try {
      await login(signinData);
      showPopup("success", "Signin successful!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Invalid email or password.";
      setSigninError(msg);
      showPopup("error", msg);
    }
  };

  return (
    <div className="loginSignup-body">
      {/* ✅ Overlay shown when submitting */}
      {authSubmitting && <LoadingOverlay label="Please wait..." />}

      <div className="loginSignup-container" id="loginSignup-container">
        {/* Sign Up */}
        <div className="loginSignup-form-container loginSignup-sign-up">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Create Account</h1>
            <span>or use your email for registration</span>
            <input
              type="text"
              placeholder="Name"
              value={signupData.name}
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
            />
            {/* Inline error */}
            {signupError && (
              <p className="login-error-message">{signupError}</p>
            )}
            <button type="button" onClick={handleSignup}>
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In */}
        <div className="loginSignup-form-container loginSignup-sign-in">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Sign In</h1>
            <span>or use your email password</span>
            <input
              type="email"
              placeholder="Email"
              value={signinData.email}
              onChange={(e) =>
                setSigninData({ ...signinData, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={signinData.password}
              onChange={(e) =>
                setSigninData({ ...signinData, password: e.target.value })
              }
            />
            {/* Inline error */}
            {signinError && (
              <p className="login-error-message">{signinError}</p>
            )}
            <button type="button" onClick={handleSignin}>
              Sign In
            </button>
          </form>
        </div>

        {/* Toggle Section */}
        <div className="loginSignup-toggle-container">
          <div className="loginSignup-toggle">
            <div className="loginSignup-toggle-panel loginSignup-toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="loginSignup-hidden" id="loginSignup-login">
                Sign In
              </button>
            </div>
            <div className="loginSignup-toggle-panel loginSignup-toggle-right">
              <h1>Hello, Friend!</h1>
              <p>
                Register with your personal details to use all of site features
              </p>
              <button className="loginSignup-hidden" id="loginSignup-register">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {popup.show && (
        <div className={`popup ${popup.type}`}>
          <p>{popup.message}</p>
        </div>
      )}
    </div>
  );
}
