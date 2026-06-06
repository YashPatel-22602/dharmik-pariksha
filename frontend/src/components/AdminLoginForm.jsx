import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminLoginForm() {
  const [lndId, setLndId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await api.post("/auth/login", {
      lndId,
      password,
      loginType: "admin"
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", "admin");

    navigate("/admin");
  };

  return (
    <>
      <input placeholder="Admin ID" onChange={e => setLndId(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Admin Login</button>
    </>
  );
}
