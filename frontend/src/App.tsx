import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute/ProtectedRoute";
import { AdminPapersPage } from "@/features/admin/pages/AdminPapersPage/AdminPapersPage";
import { AdminRequestsPage } from "@/features/admin/pages/AdminRequestsPage/AdminRequestsPage";
import { SuperAdminDepartmentsPage } from "@/features/admin/pages/SuperAdminDepartmentsPage/SuperAdminDepartmentsPage";
import { SuperAdminUsersPage } from "@/features/admin/pages/SuperAdminUsersPage/SuperAdminUsersPage";
import { AuthRestorer } from "@/features/auth/components/AuthRestorer/AuthRestorer";
import { useRoleWatcher } from "@/features/auth/hooks/useRoleWatcher";
import { LoginPage } from "@/features/auth/LoginPage/LoginPage";
import { FacultyRequestPage } from "@/features/faculty/FacultyRequestPage/FacultyRequestPage";
import { LibraryPage } from "@/features/library/LibraryPage/LibraryPage";
import { StudentRequestPage } from "@/features/student/StudentRequestPage/StudentRequestPage";

export const App = () => {
  useRoleWatcher();

  return (
    <>
      <AuthRestorer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute
              allowedRoles={["STUDENT", "FACULTY", "DEPARTMENT_ADMIN", "SUPER_ADMIN"]}
            >
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/requests"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-admin/requests"
          element={
            <ProtectedRoute allowedRoles={["DEPARTMENT_ADMIN"]}>
              <AdminRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/requests"
          element={
            <ProtectedRoute allowedRoles={["FACULTY"]}>
              <FacultyRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/department-admin/research"
          element={
            <ProtectedRoute allowedRoles={["DEPARTMENT_ADMIN"]}>
              <AdminPapersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/requests"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/research"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminPapersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/users"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/departments"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminDepartmentsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <div id="modal-root" />
    </>
  );
};
