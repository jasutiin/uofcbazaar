import { Routes, Route } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm.tsx";
import RegisterForm from "../components/auth/RegisterForm.tsx";

function Auth() {
  return (
    <div>
      <Routes>
        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />
      </Routes>
    </div>
  );
}

export default Auth;
