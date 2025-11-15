import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Button from "@/components/common/Button/Button";
import { loadGoogleScript } from "@/util/googleAuth";
import styles from "./GoogleButton.module.css";

interface GoogleButtonProps {
  clientId: string;
  onSuccess: (credential: string) => void;
  onError?: () => void;
}

interface GoogleResponse {
  credential?: string;
  select_by?: string;
}

export default function GoogleButton({ clientId, onSuccess, onError }: GoogleButtonProps) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGoogleScript()
      .then(() => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: GoogleResponse) => {
            const credential = response.credential;
            if (!credential) {
              if (onError) onError();
              return;
            }
            onSuccess(credential);
          },
        });
        setInitialized(true);
      })
      .catch(() => {
        if (onError) onError();
      });
  }, [clientId, onSuccess, onError]);

  const handleClick = () => {
    if (!initialized) return;
    setLoading(true);
    window.google.accounts.id.prompt();
  };

  return (
    <Button
      className={styles.googleButton}
      variant="secondary"
      onClick={handleClick}
      disabled={!initialized || loading}
    >
      <FcGoogle className={styles.googleIcon} />
      {loading ? "Signing in..." : "Sign In with Google"}
    </Button>
  );
}
