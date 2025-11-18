import { useState, useEffect } from "react";
import { LoginPresenter } from "./LoginPresenter";
import { useLoginLogic } from "../hooks/useLoginLogic";

const LoginPage = () => {
  const { handleGoogleLogin, error, loading } = useLoginLogic();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const handleGoogleSuccess = (code: string) => {
    void handleGoogleLogin(code);
  };

  const handleGoogleError = () => {
    console.error("Google authentication error");
  };

  const handleCloseModal = () => {
    setShowErrorModal(false);
  };

  return (
    <LoginPresenter
      googleClientId={googleClientId}
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={handleGoogleError}
      error={error}
      loading={loading}
      showErrorModal={showErrorModal}
      handleCloseModal={handleCloseModal}
    />
  );
};

export default LoginPage;
