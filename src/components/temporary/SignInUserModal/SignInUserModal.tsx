import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const SignInUserModal = ({ isOpen, onClose }: SignInUserModalProps) => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? "/";

  // Focus the input field when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleTempUserLogin = () => {
    if (username.trim() === "") {
      inputRef.current?.focus();
      return;
    }

    const tempUser = createTempStudentUser(username.trim());
    login(tempUser);
    void navigate(from, { replace: true });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTempUserLogin();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <p className={styles.tempExplanation}>
        This modal is used for development and testing purposes only. Google SSO and backend are not
        implemented yet.
      </p>

      <div className={styles.modalContentContainer}>
        {/* Left section */}
        <div className={styles.mockUsersSection}>
          <h3>Predefined Users (dev only)</h3>
          <Button
            onClick={() => {
              login(MOCK_SUPER_ADMIN);
              void navigate(from, { replace: true });
            }}
          >
            Super Admin (Charlie)
          </Button>
          <Button
            onClick={() => {
              login(MOCK_DEPT_ADMIN);
              void navigate(from, { replace: true });
            }}
          >
            Department Admin (Bob) [Computer Science]
          </Button>
          <Button
            onClick={() => {
              login(MOCK_STUDENT);
              void navigate(from, { replace: true });
            }}
          >
            Student (Alice)
          </Button>
        </div>

        {/* Right section */}
        <div className={styles.testingSection}>
          <h3>Custom Student User (testing)</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTempUserLogin();
            }}
          >
            <div className={styles.inputContainer}>
              <Input
                ref={inputRef}
                type="text"
                id="temp-username"
                placeholder="Enter your name"
                className={styles.usernameInput}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                onKeyDown={handleInputKeyDown}
                required
              />
              <Button ref={buttonRef} type="submit">
                Test
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default SignInUserModal;
