import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import { useAuth } from "@/features/auth/context/useAuth";
import { MOCK_DEPT_ADMIN, MOCK_STUDENT, MOCK_SUPER_ADMIN } from "@/mocks/mockData";
import style from "./LoginPage.module.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
          <div id="gsi-button" />

          <div className={style.tempButtonWrapper}>
            <Button
              type="button"
              onClick={() => {
                login(MOCK_SUPER_ADMIN);
                void navigate(from, { replace: true });
              }}
            >
              Sign in as SUPER_ADMIN
            </Button>
            <Button
              type="button"
              onClick={() => {
                login(MOCK_DEPT_ADMIN);
                void navigate(from, { replace: true });
              }}
            >
              Sign in as DEPARTMENT_ADMIN
            </Button>
            <Button
              type="button"
              onClick={() => {
                login(MOCK_STUDENT);
                void navigate(from, { replace: true });
              }}
            >
              Sign in as STUDENT
            </Button>
          </div>
        </div>
        <p className={style.textNotice}>Single Sign-On via Google Workspace for Education</p>
      </div>
    </div>
  );
}

export default LoginPage;
