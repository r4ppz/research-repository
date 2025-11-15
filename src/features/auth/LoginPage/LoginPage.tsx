import { useNavigate } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.svg";
import { useAuth } from "@/features/auth/context/useAuth";
import { authApi } from "@/features/auth/services/authApi";
import style from "./LoginPage.module.css";
import GoogleButton from "../components/GoogleButton/GoogleButton";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const response = await authApi.googleLogin(credential);

      loginWithToken(response.jwt, response.user);

      const from = new URLSearchParams(window.location.search).get("from") || "/";
      void navigate(from, { replace: true });
    } catch (error) {
      console.error("Google authentication failed:", error);
    }
  };

  const handleGoogleError = () => {
    console.error("Google authentication error");
  };

  return (
    <div className={style.page}>
      <div className={style.loginCard}>
        <img alt="school-logo" className={style.schoolLogo} src={schoolLogo} />

        <div className={style.headerContainer}>
          <h1 className={style.headerSchool}>Assumption College of Davao</h1>
          <h2 className={style.subHeaderTitle}>Research Repository Portal</h2>
        </div>

        <p className={style.textInstruction}>
          Please sign in using your official Assumption College of Davao email address.
        </p>

        <div className={style.googleButtonContainer}>
          <GoogleButton
            clientId={googleClientId}
            onSuccess={(credential) => {
              void handleGoogleSuccess(credential);
            }}
            onError={handleGoogleError}
          />
        </div>

        <p className={style.textNotice}>Single Sign-On via Google Workspace for Education</p>
      </div>
    </div>
  );
};

export default LoginPage;
