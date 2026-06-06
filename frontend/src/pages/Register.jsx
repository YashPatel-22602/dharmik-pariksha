import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import examCenterCodes from "../config/examCenterCodes";
import jsPDF from "jspdf";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    mobileNumber: "",
    city: "",
    examCenter: "",
    examCenterCode: "",
  });

  const downloadRegistrationPDF = (data) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(63, 81, 181);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("DHARMIK PARIKSHA", 105, 15, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.text("Registration Confirmation", 105, 25, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);

  // LND ID Box
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, 45, 180, 20, 3, 3, "F");

  doc.setFontSize(16);
  doc.text(`LND ID : ${data.lndId}`, 20, 58);

  // Candidate Information
  doc.setFontSize(14);
  doc.text("Candidate Information", 15, 80);

  doc.line(15, 83, 195, 83);

  doc.setFontSize(12);

  doc.text(`Name: ${data.name}`, 20, 95);
  doc.text(`Age: ${data.age}`, 20, 105);
  doc.text(`Gender: ${data.gender}`, 20, 115);
  doc.text(`Mobile: ${data.mobileNumber}`, 20, 125);
  doc.text(`City: ${data.city}`, 20, 135);

  // Exam Information
  doc.setFontSize(14);
  doc.text("Exam Information", 15, 155);

  doc.line(15, 158, 195, 158);

  doc.setFontSize(12);

  doc.text(
    `Exam Center: ${data.examCenter}`,
    20,
    170
  );

  doc.text(
    `Center Code: ${data.examCenterCode}`,
    20,
    180
  );

  // Notes
  doc.setFontSize(14);
  doc.text("Important Notes", 15, 205);

  doc.line(15, 208, 195, 208);

  doc.setFontSize(11);

  doc.text(
    "Keep this PDF safely.",
    20,
    220
  );

  doc.text(
    "LND ID is required for login.",
    20,
    230
  );

  doc.text(
    "Bring this receipt during exam.",
    20,
    240
  );

  // Footer
  doc.setFontSize(14);
  doc.text(
    "Thank You For Registering",
    105,
    265,
    { align: "center" }
  );

  doc.save(`${data.lndId}.pdf`);
};

  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCenterChange = (e) => {
    const selectedCode = e.target.value;
    const selectedCenter = examCenterCodes.find(
  (item) => Object.keys(item)[0] === selectedCode
);

const centerName = selectedCenter
  ? Object.values(selectedCenter)[0]
  : "";

    setForm({
      ...form,
      examCenterCode: selectedCode,
      examCenter: centerName,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessId("");

    if (!form.name || !form.mobileNumber || !form.examCenterCode) {
      return setError("Please fill all required fields.");
    }

    try {
      setLoading(true);

      const response = await API.post(
      "/auth/register",
      form
    );

    setSuccessId(response.data.lndId);

    downloadRegistrationPDF({
      ...form,
      lndId: response.data.lndId
    });

    setTimeout(() => {
      navigate("/");
    }, 20000);

    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-4">

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl w-full max-w-3xl p-10 text-white">

        <h2 className="text-4xl font-bold text-center mb-8 tracking-wide">
          Dharmik Pariksha Registration
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-300 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {successId && (
          <div className="bg-green-500/20 border border-green-400 text-green-300 p-4 rounded-lg mb-6 text-center">
            🎉 Registration Successful <br />
            <span className="font-semibold">
              Your LND ID: {successId}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

          {/* Full Name */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Full Name *
            </label>
            <input
              name="name"
              onChange={handleChange}
              className="premium-input"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Age
            </label>
            <input
              type="number"
              name="age"
              onChange={handleChange}
              className="premium-input"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Gender
            </label>
            <select
              name="gender"
              onChange={handleChange}
              className="premium-input"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Mobile Number *
            </label>
            <input
              name="mobileNumber"
              onChange={handleChange}
              className="premium-input"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              City
            </label>
            <input
              name="city"
              onChange={handleChange}
              className="premium-input"
            />
          </div>

          {/* Exam Center Dropdown */}
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Exam Center *
            </label>
            <select
              name="examCenterCode"
              onChange={handleCenterChange}
              className="premium-input"
              required
            >
              <option value="">Select Exam Center</option>
              {examCenterCodes.map((item, index) => {
              const [code, center] = Object.entries(item)[0];

              return (
                <option key={`${code}-${index}`} value={code}>
                  {center} ({code})
                </option>
              );
            })}

            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition transform duration-300 shadow-lg"
            >
              {loading ? "Registering..." : "Register Now"}
            </button>
          </div>
        </form>

        <p
          onClick={() => navigate("/")}
          className="text-center mt-6 text-indigo-300 hover:text-white cursor-pointer transition"
        >
          Back to Login
        </p>

      </div>
    </div>
  );
}
