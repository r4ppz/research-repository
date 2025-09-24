import { useCallback, useEffect } from "react";
import style from "./LoginPage.module.css";
import { handleCredentialResponse } from "../api/googleAuth";
import "../api/google";

function LoginPage() {
  const credentialHandler = useCallback(handleCredentialResponse, []);

  useEffect(() => {
    if (window.google?.accounts.id) {
      const button = document.getElementById("gsi-button");
      if (button) {
        button.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: "594492409648-b9f21kvlr8eaa77rvmlb0plrkee4qiad.apps.googleusercontent.com",
          callback: credentialHandler,
        });

        window.google.accounts.id.renderButton(button, {
          theme: "outline",
          size: "large",
          type: "standard",
          logo_alignment: "left",
        });
      }
    }
  }, [credentialHandler]);

  return (
    <div className={style.page}>
      <div className={style.loginCard}>
        <img className={style.schoolLogo} src="/assets/school-logo.svg" alt="school-logo" />
        <div className={style.headerContainer}>
          <h1 className={style.headerSchool}>Assumption College of Davao</h1>
          <h2 className={style.subHeaderTitle}>Research Library Portal</h2>
        </div>
        <p className={style.textInstruction}>
          Please sign in using your official Assumption College of Davao email address.
        </p>
        <div id="gsi-button"></div>
        <p className={style.textNotice}>Single Sign-On via Google Workspace for Education</p>
      </div>
    </div>
  );
}

export default LoginPage;
