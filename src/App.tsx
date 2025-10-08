import { Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage/LoginPage";
import HomePage from "@/features/library/HomePage/HomePage";
import RequestPage from "@/features/student/RequestPage/RequestPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route path="/request" element={<RequestPage />} />
    </Routes>
  );
}

export default App;
