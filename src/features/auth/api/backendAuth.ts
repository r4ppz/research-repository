// API utilities for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export interface BackendAuthResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface TokenRequest {
  idToken: string;
}

// Send Google ID token to backend for verification
export const authenticateWithBackend = async (idToken: string): Promise<BackendAuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status.toString()}`);
    }

    // Check if response is JSON or plain text
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as BackendAuthResponse;
    } else {
      // Backend returns plain text message
      const message = await response.text();
      return { message };
    }
  } catch (error) {
    console.error("Backend authentication failed:", error);
    throw new Error(error instanceof Error ? error.message : "Authentication failed");
  }
};

// Additional API functions you might need later
export const getCurrentUser = async (): Promise<BackendAuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if you implement JWT tokens later
        // "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status.toString()}`);
    }

    return (await response.json()) as BackendAuthResponse;
  } catch (error) {
    console.error("Failed to get current user:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to get user");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Logout failed:", error);
    // Don't throw error for logout - just log it
  }
};
