import { type User } from "@/types";

/**
 * Creates a temporary student user object
 * @param name - The student's full name
 * @returns A properly structured User object with STUDENT role
 */
export const createTempStudentUser = (name: string): User => {
  // Generate a temporary user ID
  const tempUserId = Math.floor(Math.random() * 10000) + 100;

  // Create and return the user object
  return {
    userId: tempUserId,
    email: `${name.replace(/\s+/g, "").toLowerCase()}@acdeducation.com`,
    fullName: name,
    role: "STUDENT",
    department: null,
  };
};

/**
 * Generates a temporary user ID
 * @returns A random number between 100 and 10100
 */
export const generateTempUserId = (): number => {
  return Math.floor(Math.random() * 10000) + 100;
};
