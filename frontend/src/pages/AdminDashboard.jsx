import React, { useState } from "react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("legacy");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------------- Upload Legacy Users ----------------
  const handleLegacyUpload = async (e) => {
    e.preventDefault();

    const file = e.target.file.files[0];

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setMessage("Uploading users...");

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/upload-legacy-users",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    }
  };

  // ---------------- Upload Marks ----------------
  const handleMarksUpload = async (e) => {
    e.preventDefault();

    const file = e.target.file.files[0];

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setMessage("Uploading marks...");

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/upload-marks",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    }
  };

  // ---------------- Download ZIP ----------------
  const downloadZip = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/download-users-by-center"
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "centers.zip");

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Download error", error);
      alert("Failed to download");
    }
  };

const downloadZip1 = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/download-users-reg-for-exam"
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "User_Registered_For_exam.zip");

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Download error", error);
      alert("Failed to download");
    }
  };

  return (

    <div style={styles.container}>
      {/* Sidebar */}
      {/* ✅ DESKTOP SIDEBAR */}
<div
  style={styles.sidebar}
  className="flex flex-col"
>
  <h2 style={styles.logo}>Admin Panel</h2>

  <button style={styles.menuBtn} onClick={() => setActiveTab("legacy")}>
    Upload Legacy Users
  </button>

  <button style={styles.menuBtn} onClick={() => setActiveTab("marks")}>
    Upload Marks
  </button>

  <button style={styles.menuBtn} onClick={downloadZip}>
    Download Center-wise Registered Users ZIP
  </button>

  <button style={styles.menuBtn} onClick={() => setActiveTab("registration")}>
    Registration Control
  </button>

  <button onClick={downloadZip1} style={styles.menuBtn}>
    Exam Registrations User ZIP
  </button>
</div>
      {/* Content */}
      <div style={styles.content}>
        <div style={{
  width: "100%",
  maxWidth: "500px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
}}>

  {/* ☰ Mobile button */}
  <button
    className="md:hidden px-3 py-2 bg-blue-600 text-white rounded"
    onClick={() => setSidebarOpen(true)}
  >
    ☰
  </button>

  <h1 style={styles.heading}>Admin Dashboard</h1>

</div>

        {/* -------- Legacy Tab -------- */}
        {activeTab === "legacy" && (
          <div style={styles.card}>
            <h2>Upload Legacy Users</h2>

            <form onSubmit={handleLegacyUpload}>
              <input
                type="file"
                name="file"
                accept=".xlsx,.xls"
                required
                style={styles.fileInput}
              />

              <button style={styles.button}>
                Upload Users
              </button>
            </form>
          </div>
        )}

        {/* -------- Marks Tab -------- */}
        {activeTab === "marks" && (
          <div style={styles.card}>
            <h2>Upload Exam Marks</h2>

            <p>
              Upload marks for Level 0, Level 1 and Level 2 exams.
            </p>

            <form onSubmit={handleMarksUpload}>
              <input
                type="file"
                name="file"
                accept=".xlsx,.xls"
                required
                style={styles.fileInput}
              />

              <button style={styles.button}>
                Upload Marks
              </button>
            </form>
          </div>
        )}

        {activeTab === "registration" && (
  <div style={styles.card}>
    <h2>Exam Registration Control</h2>

    <button
      style={styles.button}
onClick={async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/api/admin/toggle-registration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();
    setMessage(
    data.isOpen
    ? "Registration is OPEN ✅"
    : "Registration is CLOSED ❌"
);
  } catch (error) {
    console.error(error);
    setMessage("Toggle failed");
  }
}}
    >
      Toggle Registration
    </button>
  </div>
)}

        {/* -------- Message -------- */}
        {message && (
          <p style={styles.message}>{message}</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial",
  },

  sidebar: {
  width: "250px",
  background: "#1f2937",
  color: "white",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",            // ✅ spacing between buttons
},  

  logo: {
    marginBottom: "30px",
  },

  menuBtn: {
  padding: "12px",
  background: "#374151",
  border: "none",
  color: "white",
  cursor: "pointer",
  borderRadius: "6px",
  textAlign: "left",
  transition: "0.2s",
},

  content: {
  flex: 1,
  padding: "40px",
  background: "#f3f4f6",
  display: "flex",
  flexDirection: "column",
},

  heading: {
    marginBottom: "30px",
  },

  card: {
  background: "white",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  width: "100%",          // ✅ full width
  maxWidth: "500px",      // ✅ limit size
},

  fileInput: {
    marginTop: "20px",
    marginBottom: "20px",
  },

  button: {
    background: "#2563eb",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  message: {
    marginTop: "20px",
    fontWeight: "bold",
    color: "green",
  },
};

export default AdminDashboard;