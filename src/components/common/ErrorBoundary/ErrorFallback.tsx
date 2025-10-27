import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";

interface ErrorFallbackProps {
  error: Error | null;
}

function ErrorFallback({ error }: ErrorFallbackProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    void navigate("/");
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="error-fallback-container">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <p className="error-message">{error?.message || "An unexpected error occurred"}</p>
        <div className="error-actions">
          <Button onClick={handleGoHome}>Go to Home</Button>
          <Button variant="secondary" onClick={handleReload}>
            <RotateCcw size={16} />
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
