import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("user");
  const [lndId, setLndId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload =
        activeTab === "user"
          ? { lndId, mobileNumber, loginType: "user" }
          : { lndId, password, loginType: "admin" };

      const res = await API.post("/auth/login", payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Dharmik Pariksha Portal
        </h1>

        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("user")}
            className={`w-1/2 py-2 font-semibold rounded-l-lg ${
              activeTab === "user"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            User Login
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`w-1/2 py-2 font-semibold rounded-r-lg ${
              activeTab === "admin"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="text"
            placeholder="LND ID"
            value={lndId}
            onChange={(e) => setLndId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            required
          />

          {activeTab === "admin" && (
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          )}

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        {activeTab === "user" && (
  <p className="text-center mt-4 text-sm">
    Don’t have an account?{" "}
    <span
      onClick={() => navigate("/register")}
      className="text-indigo-600 cursor-pointer font-semibold hover:underline"
    >
      Register
    </span>
  </p>
)}

      </div>
    </div>
  );
}
