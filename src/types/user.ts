type Role = "STUDENT" | "DEPARTMENT_ADMIN" | "SUPER_ADMIN";

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  department: Department | null;
}
