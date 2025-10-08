import style from "./LoginPage.module.css";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

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
