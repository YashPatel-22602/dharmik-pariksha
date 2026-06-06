import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function UserLoginForm() {
  const [lndId, setLndId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await api.post("/auth/login", {
      lndId,
      mobileNumber,
      loginType: "user"
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", "user");

    navigate("/user");
  };

  return (
    <>
      <input placeholder="LND ID" onChange={e => setLndId(e.target.value)} />
      <input placeholder="Mobile Number" onChange={e => setMobileNumber(e.target.value)} />
      <button onClick={login}>Login</button>
    </>
  );
}
