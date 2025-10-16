import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Button from "@/components/common/Button/Button";
import style from "./LoginPage.module.css";
import SignInUserModal from "../../../components/temporary/SignInUserModal/SignInUserModal";

function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onClose = () => {
    setIsModalOpen(false);
  };
  return (
    <div className={style.page}>
      <div className={style.loginCard}>
        <img alt="school-logo" className={style.schoolLogo} src="/assets/school-logo.svg" />

        <div className={style.headerContainer}>
          <h1 className={style.headerSchool}>Assumption College of Davao</h1>
          <h2 className={style.subHeaderTitle}>Research Repository Portal</h2>
        </div>

        <p className={style.textInstruction}>
          Please sign in using your official Assumption College of Davao email address.
        </p>

        <div className={style.googleButtonContainer}>
          {/* TODO: implement google sso button */}
          <div id="gsi-button" />

          {/* NOTE: this is just a temp singin button */}
          <Button
            className={style.signInButton}
            variant="secondary"
            onClick={() => {
              setIsModalOpen(
                confirm(
                  "Google SSO is not set up and there is no backend yet. Using temporary test users for now.",
                ),
              );
            }}
          >
            <FcGoogle size={20} />
            Sign In with Google
          </Button>
        </div>
        <SignInUserModal onClose={onClose} isOpen={isModalOpen} />
        <p className={style.textNotice}>Single Sign-On via Google Workspace for Education</p>
      </div>
    </div>
  );
}

export default LoginPage;
