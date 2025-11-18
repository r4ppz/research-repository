import schoolLogo from "@/assets/school-logo.svg";
import Button from "@/components/common/Button/Button";
import Modal from "@/components/common/Modal/Modal";
import style from "./LoginPage.module.css";
import GoogleButton from "../components/GoogleButton/GoogleButton";

interface LoginPresenterProps {
  googleClientId: string;
  onGoogleSuccess: (code: string) => void;
  onGoogleError: () => void;
  error: string | null;
  loading: boolean;
  showErrorModal: boolean;
  handleCloseModal: () => void;
}

export const LoginPresenter = ({
  googleClientId,
  onGoogleSuccess,
  onGoogleError,
  error,
  showErrorModal,
  handleCloseModal,
}: LoginPresenterProps) => {
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
            onSuccess={(code) => {
              onGoogleSuccess(code);
            }}
            onError={onGoogleError}
          />
        </div>

        <p className={style.textNotice}>Single Sign-On via Google Workspace for Education</p>
      </div>

      <Modal className={style.errorModal} isOpen={showErrorModal} onClose={handleCloseModal}>
        <h2 className={style.modalTitle}>Login Error</h2>
        <div className={style.descriptionContainer}>
          <p className={style.modalDescription}>{error}</p>
        </div>
      </Modal>
    </div>
  );
};
