import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";


const AdminDashboard = () => {

const COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#06B6D4"
];
  const [activeTab, setActiveTab] = useState("legacy");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {

  if (activeTab === "analytics") {
    fetchAnalytics();
  }

}, [activeTab]);
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
        "https://dharmik-pariksha.onrender.com/api/admin/upload-legacy-users",
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
        "https://dharmik-pariksha.onrender.com/api/admin/upload-marks",
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
        "https://dharmik-pariksha.onrender.com/api/admin/download-users-by-center"
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
        "https://dharmik-pariksha.onrender.com/api/admin/download-users-reg-for-exam"
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

  const fetchAnalytics = async () => {

  try {

    const res = await fetch(
      "https://dharmik-pariksha.onrender.com/api/admin/analytics",
      {
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    const data = await res.json();

    setAnalytics(data);

  } catch (err) {

    console.error(
      "Analytics Error",
      err
    );

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

  <button
  style={styles.menuBtn}
  onClick={() => setActiveTab("analytics")}
>
  Analytics
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
      "https://dharmik-pariksha.onrender.com/api/admin/toggle-registration",
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



{/* LEVEL WISE PIE CHART */}
{activeTab === "analytics" && analytics && (
<>
<div
  style={{
    background:"#fff",
    borderRadius:"20px",
    padding:"25px",
    marginTop:"20px",
    boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
  }}
>
  <h3>📊 Level Wise Distribution</h3>

  <ResponsiveContainer width="100%" height={350}>
    <PieChart>
      <Pie
        data={analytics.levelWise}
        dataKey="count"
        nameKey="_id"
        outerRadius={
        window.innerWidth < 768 ? 90 : 130
      }
      innerRadius={
        window.innerWidth < 768 ? 45 : 70
      }
        paddingAngle={4}
        label
      >
        {analytics.levelWise.map((entry,index)=>(
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>


{/* GENDER PIE CHART */}

<div
  style={{
    background:"#fff",
    borderRadius:"20px",
    padding:"25px",
    marginTop:"30px",
    boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
  }}
>
  <h3>👨 Gender Distribution</h3>

  <ResponsiveContainer width="100%" height={350}>
    <PieChart>
      <Pie
        data={analytics.genderWise}
        dataKey="count"
        nameKey="_id"
        outerRadius={
  window.innerWidth < 768 ? 90 : 130
}
innerRadius={
  window.innerWidth < 768 ? 45 : 70
}
        label
      >
        {analytics.genderWise.map((entry,index)=>(
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>


{/* YEAR WISE BAR CHART */}

<div
  style={{
    background:"#fff",
    borderRadius:"20px",
    padding:"25px",
    marginTop:"30px",
    boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
  }}
>
  <h3>📈 Year Wise Results</h3>

  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={analytics.yearWise}>
      <XAxis dataKey="_id" />
      <YAxis />
      <Tooltip />
      <Legend />

      <Bar
        dataKey="count"
        fill="#6366F1"
        radius={[10,10,0,0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>


{/* CENTER WISE CHART */}

<div
  style={{
    background:"#fff",
    borderRadius:"20px",
    padding:"25px",
    marginTop:"30px",
    boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
  }}
>
  <h3>🏫 Center Wise Users Registered for the Exam</h3>

  <ResponsiveContainer
  width="100%"
  height={
    analytics?.centerWise?.length > 10
      ? 700
      : 400
  }
>
    <BarChart
      data={analytics.centerWise}
      layout="vertical"
    >
      <XAxis type="number" />

      <YAxis
        type="category"
        dataKey="_id"
        width={150}
      />

      <Tooltip />

      <Bar
        dataKey="count"
        fill="#8B5CF6"
        radius={[0,10,10,0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>


{/* TOP 3 LEVEL WISE TOPPERS */}

<div
  style={{
    background:"#fff",
    borderRadius:"20px",
    padding:"25px",
    marginTop:"30px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)"
  }}
>

<h3
  style={{
    fontSize:"28px",
    fontWeight:"700",
    marginBottom:"20px"
  }}
>
🏆 Level Wise Toppers
</h3>

{Object.entries(
  analytics.topLevelWise || {}
).map(([level, students]) => (

<div
  key={level}
  style={{
    marginBottom:"30px"
  }}
>

<div
  style={{
    background:
      "linear-gradient(135deg,#4F46E5,#7C3AED)",
    color:"#fff",
    padding:"12px 20px",
    borderRadius:"12px",
    marginBottom:"15px",
    fontSize:"20px",
    fontWeight:"bold"
  }}
>
🎓 Level {level}
</div>

<table
  style={{
    width:"100%",
    borderCollapse:"collapse"
  }}
>

<thead>

<tr
  style={{
    background:"#EEF2FF"
  }}
>
<th style={styles.tableHead}>Rank</th>
<th style={styles.tableHead}>Name</th>
<th style={styles.tableHead}>Marks</th>
<th style={styles.tableHead}>
Submission Time
</th>
</tr>

</thead>

<tbody>

{students.map(
(student,index)=>(

<tr key={index}>

<td style={styles.tableCell}>
{
index===0
? "🥇"
: index===1
? "🥈"
: "🥉"
}
</td>

<td style={styles.tableCell}>
{student.name}
</td>

<td style={styles.tableCell}>
{student.marks}
</td>

<td style={styles.tableCell}>
{
new Date(student.submittedAt)
.toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
})
}
</td>

</tr>

)
)}

</tbody>

</table>

</div>

))}

</div>
</>
)};
{/* -------- Message -------- */}
{message && (
  <p style={styles.message}>{message}</p>
)}

      </div>
    </div>
  );
};

const styles = {

  tableHead: {
  padding: "12px",
  textAlign: "left",
  color: "#4338CA",
  borderBottom:
    "2px solid #E5E7EB"
},

tableCell: {
  padding: "12px",
  borderBottom:
    "1px solid #E5E7EB"
},

  container: {
  display: "flex",
  flexDirection:
    window.innerWidth < 768
      ? "column"
      : "row",
  minHeight: "100vh",
  fontFamily: "Arial",
},

  sidebar: {
  width:
    window.innerWidth < 768
      ? "100%"
      : "250px",
  background: "#1f2937",
  color: "white",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
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
  padding: window.innerWidth < 768 ? "15px" : "40px",
  background: "#f3f4f6",
  display: "flex",
  flexDirection: "column",
},

  heading: {
    marginBottom: "30px",
  },

card: {
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  width: "100%",
  maxWidth: "100%",
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

analyticsCard: {
  background:
    "linear-gradient(135deg,#4F46E5,#7C3AED)",
  color:"#fff",
  padding:"30px",
  borderRadius:"24px",
  textAlign:"center",
  boxShadow:
    "0 20px 40px rgba(79,70,229,0.35)",
  transition:"all 0.3s ease",
},

chartCard: {
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  width: "100%",
  maxWidth: "100%"
},
};

export default AdminDashboard;
