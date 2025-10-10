import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/common/ProtectedRoute/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage/LoginPage";
import DepartmentAdminRequestsPage from "@/features/departmentAdmin/RequestPage/RequestPage";
import DepartmentAdminResearchPage from "@/features/departmentAdmin/ResearchPage/ResearchPage";
import LibraryPage from "@/features/homepage/LibraryPage/LibraryPage";
import StudentRequestsPage from "@/features/student/RequestPage/RequestPage";
import SuperAdminRequestsPage from "@/features/superAdmin/RequestPage/RequestPage";
import SuperAdminResearchPage from "@/features/superAdmin/ResearchPage/ResearchPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["STUDENT", "DEPARTMENT_ADMIN", "SUPER_ADMIN"]}>
            <LibraryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/requests"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentRequestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/department-admin/requests"
        element={
          <ProtectedRoute allowedRoles={["DEPARTMENT_ADMIN"]}>
            <DepartmentAdminRequestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/department-admin/research"
        element={
          <ProtectedRoute allowedRoles={["DEPARTMENT_ADMIN"]}>
            <DepartmentAdminResearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/requests"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminRequestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/super-admin/research"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminResearchPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
