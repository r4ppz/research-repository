import type { GoogleCredentialResponse } from "./types";

export const authenticateWithGoogle = async (idToken: string): Promise<string> => {
  const response = await fetch("http://localhost:8080/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${String(response.status)}`);
  }

  return response.text();
};

export const handleCredentialResponse = (response: GoogleCredentialResponse): void => {
  const idToken = response.credential;

  authenticateWithGoogle(idToken)
    .then((data) => {
      console.log("Backend response:", data);
    })
    .catch((error: unknown) => {
      console.error("Backend authentication failed:", error);
    });
};
