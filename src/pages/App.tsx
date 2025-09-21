import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
