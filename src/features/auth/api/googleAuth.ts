// Google Sign-In configuration and handlers
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  backendMessage?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  [key: string]: unknown;
}

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const initializeGoogleSignIn = (onSignIn: (response: AuthResponse) => void) => {
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (credentialResponse: google.accounts.id.CredentialResponse) => {
      void handleCredentialResponse(credentialResponse, onSignIn);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
};

export const renderGoogleSignInButton = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    window.google.accounts.id.renderButton(element, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
    });
  }
};

const handleCredentialResponse = async (
  credentialResponse: google.accounts.id.CredentialResponse,
  onSignIn: (response: AuthResponse) => void
) => {
  try {
    if (!credentialResponse.credential) {
      throw new Error("No credential received");
    }

    // Send the ID token directly to your backend for verification
    // Import the backend auth function at the top of the file
    const { authenticateWithBackend } = await import("./backendAuth");

    const backendResponse = await authenticateWithBackend(credentialResponse.credential);
    console.log("Backend response:", backendResponse.message);

    // Decode the JWT token to get user information for frontend use
    const userInfo = parseJwt(credentialResponse.credential);

    // Validate that the email is from the allowed domain (optional)
    if (!isValidEmailDomain()) {
      throw new Error("Please use your official Assumption College of Davao email address");
    }

    const googleUser: GoogleUser = {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
    };

    onSignIn({
      success: true,
      user: googleUser,
      backendMessage: backendResponse.message,
    });
  } catch (error) {
    console.error("Google Sign-In error:", error);
    onSignIn({
      success: false,
      error: error instanceof Error ? error.message : "Sign-in failed",
    });
  }
};

// Parse JWT token to extract user information
const parseJwt = (token: string): JwtPayload => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    throw new Error("Invalid token format");
  }
};

// Validate email domain (customize this based on your requirements)
const isValidEmailDomain = (): boolean => {
  // Allow any email for now, but you can restrict to specific domains
  // Example: return email.endsWith('@acd.edu.ph');
  return true;
};

// Sign out function
export const signOut = () => {
  window.google.accounts.id.disableAutoSelect();
  // Clear any stored authentication data
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
};
