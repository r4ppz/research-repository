import { useEffect } from "react";
import style from "./LoginPage.module.css";
import {
  initializeGoogleSignIn,
  renderGoogleSignInButton,
  type AuthResponse,
} from "../api/googleAuth";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    const handleSignIn = (response: AuthResponse) => {
      if (response.success && response.user) {
        console.log("Sign-in successful:", response.user);
        console.log("Backend message:", response.backendMessage);

        // Store user data (you might want to use a state management solution)
        localStorage.setItem("user", JSON.stringify(response.user));

        // Show backend response message
        if (response.backendMessage) {
          alert(`${response.backendMessage}\nWelcome, ${response.user.name}!`);
        } else {
          alert(`Welcome, ${response.user.name}!`);
        }

        // TODO: Redirect to dashboard or home page based on user role
        // Example: navigate('/dashboard');
      } else {
        console.error("Sign-in failed:", response.error);
        alert(response.error ?? "Sign-in failed. Please try again.");
      }
    };

    // Initialize Google Sign-In
    initializeGoogleSignIn(handleSignIn);
    renderGoogleSignInButton("gsi-button");
  }, []);

  return (
    <div className={style.page}>
      <div className={style.loginCard}>
        <img className={style.schoolLogo} src="/assets/school-logo.svg" alt="school-logo" />
        <div className={style.headerContainer}>
          <h1 className={style.headerSchool}>Assumption College of Davao</h1>
          <h2 className={style.subHeaderTitle}>Research Repository Portal</h2>
        </div>
        <p className={style.textInstruction}>
          Please sign in using your official Assumption College of Davao email address.
        </p>
        <div className={style.googleButtonContainer}>
          <div id="gsi-button"></div>
          <button
            type="button"
            onClick={() => {
              console.log("Navigate to homepage");
              void navigate("/homepage");
            }}
          >
            Navigate to home (test)
          </button>
        </div>
        <p className={style.textNotice}>Single Sign-On via Google Workspace for Education</p>
      </div>
    </div>
  );
}

export default LoginPage;
