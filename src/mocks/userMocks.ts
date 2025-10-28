import { type User } from "@/types";

export const MOCK_STUDENT: User = {
  userId: 1,
  email: "alice@acdeducation.com",
  fullName: "Alice Wonderland",
  role: "STUDENT",
  department: null,
};

export const MOCK_STUDENT2: User = {
  userId: 4,
  email: "john@acdeducation.com",
  fullName: "John Student",
  role: "STUDENT",
  department: null,
};

export const MOCK_STUDENT3: User = {
  userId: 5,
  email: "maria@acdeducation.com",
  fullName: "Maria Garcia",
  role: "STUDENT",
  department: null,
};

export const MOCK_STUDENT4: User = {
  userId: 6,
  email: "james@acdeducation.com",
  fullName: "James Wilson",
  role: "STUDENT",
  department: null,
};

export const MOCK_STUDENT5: User = {
  userId: 7,
  email: "sophia@acdeducation.com",
  fullName: "Sophia Chen",
  role: "STUDENT",
  department: null,
};

export const MOCK_DEPT_ADMIN: User = {
  userId: 2,
  email: "bob@acdeducation.com",
  fullName: "Bob Admin",
  role: "DEPARTMENT_ADMIN",
  department: { departmentId: 1, departmentName: "Computer Science" },
};

export const MOCK_SUPER_ADMIN: User = {
  userId: 3,
  email: "charlie@acdeducation.com",
  fullName: "Charlie SuperAdmin",
  role: "SUPER_ADMIN",
  department: null,
};
