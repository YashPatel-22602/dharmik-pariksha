import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Loader from "../components/Loader";
import logo from "../assets/new_logo.png";
export default function Login() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("user");
  const [lndId, setLndId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div
className="
min-h-screen
flex
items-center
justify-center
px-4
"
style={{
background:"#7a004b"
}}
>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <div className="flex justify-center mb-4">
  <img
    src={logo}
    alt="Logo"
    className="
      w-28
      md:w-40
      object-contain
    "
  />
</div>
        <div className="text-center mb-6">
  <h1
    className="
      text-4xl
      md:text-5xl
      font-extrabold
      tracking-wide
      text-[#7a004b]
    "
    style={{
      textShadow:
        "2px 2px 8px rgba(122,0,75,0.25)"
    }}
  >
    Satsang Gnan
  </h1>

  <h2
    className="
      text-3xl
      md:text-4xl
      font-black
      mt-2
      text-[#7a004b]
    "
  >
    Pariksha 2026
  </h2>

  <div
    className="mx-auto mt-3"
    style={{
      width: "120px",
      height: "4px",
      background:
        "linear-gradient(to right,#7a004b,#b0006d,#7a004b)",
      borderRadius: "999px"
    }}
  />
</div>


        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("user")}
            className={`w-1/2 py-2 font-semibold rounded-l-lg ${
              activeTab === "user"
                ? "bg-[#7a004b] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            User Login
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`w-1/2 py-2 font-semibold rounded-r-lg ${
              activeTab === "admin"
                ? "bg-[#7a004b] text-white"
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
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#7a004b]"
            required
          />

          {activeTab === "admin" && (
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#7a004b]"
              required
            />
          )}

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#7a004b] text-white py-2 rounded-lg font-semibold hover:bg-[#5c0038] transition"
          >
            Login
          </button>
        </form>

        {activeTab === "user" && (
  <p className="text-center mt-4 text-sm">
    For New User Registration Click Here ---{'>'} {" "}
    <span
      onClick={() => navigate("/register")}
      className="text-[#7a004b] cursor-pointer font-semibold hover:underline"
    >
      Register
    </span>
  </p>
)}

      </div>
    </div>
  );
}
