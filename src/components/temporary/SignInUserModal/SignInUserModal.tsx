import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Button from "@/components/common/Button/Button";
import Modal from "@/components/common/Modal/Modal";
import { useAuth } from "@/features/auth/context/useAuth";
import { MOCK_DEPT_ADMIN, MOCK_STUDENT, MOCK_SUPER_ADMIN } from "@/mocks/userMocks";

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* INFO: temp buttons to switch users */}
      <div>
        <Button
          type="button"
          onClick={() => {
            login(MOCK_SUPER_ADMIN);
            void navigate(from, { replace: true });
          }}
        >
          Sign in as Super Admin (Charlie)
        </Button>
        <Button
          type="button"
          onClick={() => {
            login(MOCK_DEPT_ADMIN);
            void navigate(from, { replace: true });
          }}
        >
          Sign in as Department Admin (Bob)
        </Button>
        <Button
          type="button"
          onClick={() => {
            login(MOCK_STUDENT);
            void navigate(from, { replace: true });
          }}
        >
          Sign in as Student (Alice)
        </Button>
      </div>
    </Modal>
  );
}

export default SignInUserModal;
