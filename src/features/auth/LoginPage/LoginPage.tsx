import style from "./LoginPage.module.css";
import LoginForm from "../LoginForm/LoginForm";

function LoginPage() {
  return (
    <div className={style.page}>
      <div className={style.loginContainer}>
        <div className={style.introCard}>
          <img className={style.logo} src="/school-logo.svg" alt="school-logo" />
          <h1 className={style.textTitle}>Assumption Research Repository</h1>
        </div>
        <div className={style.loginCard}>
          <div className={style.textContainer}>
            <h2 className={style.textHeader}>Login</h2>
            <p className={style.text}>Enter your credentials to access the main dashboard</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
