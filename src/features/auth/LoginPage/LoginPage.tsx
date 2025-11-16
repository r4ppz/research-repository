import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import schoolLogo from "@/assets/school-logo.svg";
import { AuthResponse } from "@/types";
import style from "./LoginPage.module.css";
import { loginWithGoogle } from "../api/google";
import GoogleButton from "../components/GoogleButton/GoogleButton";
import { useAuth } from "../context/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const handleGoogleSuccess = async (code: string) => {
    try {
      const data: AuthResponse = await loginWithGoogle(code);
      loginWithToken(data.jwt, data.user);
      void navigate("/", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      console.error("Login failed:", axiosErr.response?.data.error ?? axiosErr.message);
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
            onSuccess={(credential) => void handleGoogleSuccess(credential)}
            onError={handleGoogleError}
          />
        </div>

        <p className={style.textNotice}>Single Sign-On via Google Workspace for Education</p>
      </div>
    </div>
  );
};

export default LoginPage;
