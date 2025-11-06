import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import Input from "@/components/common/Input/Input";
import Modal from "@/components/common/Modal/Modal";
import { useAuth } from "@/features/auth/context/useAuth";
import { MOCK_DEPT_ADMIN, MOCK_STUDENT, MOCK_SUPER_ADMIN } from "@/mocks/userMocks";
import { createTempStudentUser } from "@/temp/userService";
import styles from "./SignInUserModal.module.css";

interface LocationState {
  from?: { pathname: string };
}

interface SignInUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SignInUserModal({ isOpen, onClose }: SignInUserModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? "/";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Function to handle temporary user login using the new service
  const handleTempUserLogin = (name: string) => {
    const tempUser = createTempStudentUser(name);
    login(tempUser);
    void navigate(from, { replace: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Explanation text about the temporary modal */}
      <p className={styles.tempExplanation}>
        This modal is used for development and testing purposes only. Google SSO and backend are not
        implemented yet.
      </p>

      {/* Container for left and right sections */}
      <div className={styles.modalContentContainer}>
        {/* Left section: existing mock users */}
        <div className={styles.mockUsersSection}>
          <h3>Predefined Users (dev only)</h3>
          <Button
            type="button"
            onClick={() => {
              login(MOCK_SUPER_ADMIN);
              void navigate(from, { replace: true });
            }}
          >
            Super Admin (Charlie)
          </Button>
          <Button
            type="button"
            onClick={() => {
              login(MOCK_DEPT_ADMIN);
              void navigate(from, { replace: true });
            }}
          >
            Department Admin (Bob) [Computer Science]
          </Button>
          <Button
            type="button"
            onClick={() => {
              login(MOCK_STUDENT);
              void navigate(from, { replace: true });
            }}
          >
            Student (Alice)
          </Button>
        </div>

        {/* Right section: testing feature */}
        <div className={styles.testingSection}>
          <h3>Custom Student User (testing)</h3>
          <div className={styles.inputContainer}>
            <Input
              type="text"
              id="temp-username"
              placeholder="Enter your name"
              className={styles.usernameInput}
            />
            <Button
              type="button"
              onClick={() => {
                const inputElement = document.getElementById("temp-username");
                if (
                  inputElement &&
                  inputElement instanceof HTMLInputElement &&
                  inputElement.value.trim() !== ""
                ) {
                  handleTempUserLogin(inputElement.value.trim());
                }
              }}
            >
              Test
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SignInUserModal;
