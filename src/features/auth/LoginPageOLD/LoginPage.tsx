import { useCallback, useEffect } from "react";
import style from "./LoginPage.module.css";

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

function LoginPage() {
  const handleCredentialResponse = useCallback((response: GoogleCredentialResponse) => {
    const idToken = response.credential;

    fetch("http://localhost:8080/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.text();
      })
      .then((data) => {
        console.log("Backend response:", data);
      })
      .catch((error) => {
        console.error("Backend authentication failed:", error);
      });
  }, []);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "594492409648-b9f21kvlr8eaa77rvmlb0plrkee4qiad.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(document.getElementById("gsi-button")!, {
        theme: "outline",
        size: "large",
        type: "standard",
      });
    }
  }, [handleCredentialResponse]);

  return (
    <div className={style.page}>
      <div className={style.loginContainer}>
        <div className={style.introCard}>
          <img className={style.logo} src="/school-logo.svg" alt="school-logo" />
          <div className={style.introTextContainer}>
            <h1 className={style.introTitle}>ACD Research Repository</h1>
            <p className={style.introDescription}>
              Access academic research across disciplines, featuring studies and innovations from
              our faculty and students
            </p>
          </div>
        </div>
        <div className={style.loginCard}>
          <div className={style.loginTextContainer}>
            <h2 className={style.loginTextHeader}>Login</h2>
            <p className={style.loginText}>
              Please sign in using your official Assumption College of Davao email address.
            </p>
          </div>
          <div id="gsi-button" className={style.googleButtonContainer}></div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
