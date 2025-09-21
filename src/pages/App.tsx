import { Routes, Route } from "react-router-dom";
import LoginPage from "../features/auth/loginpage/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
