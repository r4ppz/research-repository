import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage/LoginPage";
import HomePage from "../features/researchRepo/HomePage/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/homepage" element={<HomePage />} />
    </Routes>
  );
}

export default App;
