import type { Role, User } from "@/types";

function hasRole(user: User | null | undefined, ...roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export const isUserStudent = (user: User | null | undefined) => hasRole(user, "STUDENT");
export const isUserFaculty = (user: User | null | undefined) => hasRole(user, "FACULTY");
export const isUserStudentOrFaculty = (user: User | null | undefined) =>
  hasRole(user, "STUDENT", "FACULTY");
export const isUserDepartmentAdmin = (user: User | null | undefined) =>
  hasRole(user, "DEPARTMENT_ADMIN");
export const isUserSuperAdmin = (user: User | null | undefined) => hasRole(user, "SUPER_ADMIN");
export const isUserSuperOrDepartmentAdmin = (user: User | null | undefined) =>
  hasRole(user, "SUPER_ADMIN", "DEPARTMENT_ADMIN");
