import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function UserDashboard() {

const navigate = useNavigate();
// ✅ Exam Registration States
const [registrationOpen, setRegistrationOpen] = useState(false);
const [alreadyRegistered, setAlreadyRegistered] = useState(false);
const [registeredLevel, setRegisteredLevel] = useState(null);
const [wantExam, setWantExam] = useState(false);
const [level, setLevel] = useState("Level 0");
const [activeTab,setActiveTab] = useState("overview");
const [profile,setProfile] = useState(null);
const [results,setResults] = useState([]);
const [levelData,setLevelData] = useState([]);
const [genderData,setGenderData] = useState([]);
const [yearData,setYearData] = useState([]);
const [sidebarOpen, setSidebarOpen] = useState(false);

const [loading,setLoading] = useState(true);
const [error,setError] = useState("");

const [theme,setTheme] = useState(() => {
const saved = localStorage.getItem("theme");

if(saved) return saved;
if(window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
return "light";
});

/* ================= THEME ================= */

useEffect(()=>{
const root=document.documentElement;
root.classList.remove("light","dark");
root.classList.add(theme);
localStorage.setItem("theme",theme);
},[theme]);

const toggleTheme=()=>setTheme(prev=>prev==="dark"?"light":"dark");

/* ================= FETCH DATA ================= */

useEffect(()=>{
fetchData();

},[]);

const fetchData = async () => {

try{

setLoading(true);
setError("");

const [u,r,l,g,y,check] = await Promise.all([
  API.get("/auth/me"),
  API.get("/results/my"),
  API.get("/dashboard/levels"),
  API.get("/dashboard/gender"),
  API.get("/dashboard/registrations"),

  API.get("/registration/check")     // ✅ ADD
]);

setProfile(u.data);
setResults(r.data || []);
setLevelData(l.data || []);
setGenderData(g.data || []);
setYearData(y.data || []);
setRegistrationOpen(check.data?.isOpen || false);
setAlreadyRegistered(check.data?.registered || false);
setRegisteredLevel(check.data?.level || null);

console.log("LEVEL DATA", l.data);
console.log("GENDER DATA", g.data);
console.log("YEAR DATA", y.data);
console.log("RESULTS DATA", r.data);

console.log("CHECK API RESPONSE:", check.data);
}catch (err) {
  console.error("CHECK API ERROR:", err.response?.data || err.message);
  setError("Failed to load dashboard data.");
}
finally{
setLoading(false);
}

};

const logout = () => {
localStorage.removeItem("token");
localStorage.removeItem("role");
navigate("/");
};

const handleExamRegistration = async () => {

  if (alreadyRegistered) {
    alert("You have already registered for the exam");
    return;
  }

  if (!wantExam) {
    alert("Please select 'I want to appear for exam'");
    return;
  }

  try {
    await API.post("/registration/register", {
      lndId : profile.lndId,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      level: wantExam ? level : null,
      isAppearing: wantExam,
      center : profile.examCenter,
      
      
    });

    alert("Thank You for Submitting the Form");
    setAlreadyRegistered(true);
    setRegisteredLevel(level);

  } catch (err) {
  if (err.response?.data?.message) {
    alert(err.response.data.message);   // ✅ SHOW BACKEND MESSAGE
  } else {
    alert("Registration failed");
  }
}
};

/* ================= CALCULATIONS ================= */

const totalExams = results.length;

const highestScore =
totalExams>0 ? Math.max(...results.map(r=>r.marks || r.Marks || 0)) : 0;

const averageScore =
totalExams>0 ?
Math.round(results.reduce((a,r)=>a+(r.marks||r.Marks||0),0)/totalExams)
:0;

const getRank=()=>{
if(averageScore>=80) return "Gold 🥇";
if(averageScore>=60) return "Silver 🥈";
return "Bronze 🥉";
};

/* ================= BEST EXAM ================= */

const bestExam = results.reduce((best,current)=>{
if(!best) return current;
return (current.marks || current.Marks) > (best.marks || best.Marks) ? current : best;
},null);

/* ================= PROGRESS GRAPH DATA ================= */

const progressData = results
.map(r => ({
  year:
  r.examYear ||
  r.year ||
  r.Year ||
  r.exam_year ||
  "N/A",

  marks:
  r.marks ||
  r.Marks ||
  0
}))
.sort((a,b)=>a.year-b.year);

/* ================= LOADING ================= */

if(loading){
return(
<div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
Loading Dashboard...
</div>
);
}

if(error){
return(
<div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900">
<p className="text-red-500 mb-4">{error}</p>
<button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
Retry
</button>
</div>
);
}

/* ================= UI ================= */

return(

<div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">

{/* ✅ DESKTOP SIDEBAR */}
<div className="hidden lg:flex w-64 bg-white/70 dark:bg-gray-800 backdrop-blur-xl shadow-2xl p-6 flex-col justify-between">

  <div>
    <h2 className="text-2xl font-bold text-indigo-600 dark:text-white mb-10">
      Dashboard
    </h2>

    <nav className="flex flex-col gap-4">
      {["overview","analytics","profile","registration"].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-xl capitalize ${
            activeTab === tab
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  </div>

  <button
    onClick={logout}
    className="px-4 py-2 bg-red-500 text-white rounded-xl"
  >
    Logout
  </button>

</div>


{/* ✅ MOBILE SIDEBAR */}
{sidebarOpen && (
  <div className="fixed inset-0 z-50 flex">

    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/50"
      onClick={() => setSidebarOpen(false)}
    />

    {/* Sidebar */}
    <div className="relative w-64 bg-white dark:bg-gray-800 p-6 shadow-2xl">

      <h2 className="text-2xl font-bold text-indigo-600 dark:text-white mb-10">
        Dashboard
      </h2>

      <nav className="flex flex-col gap-4">
        {["overview","analytics","profile","registration"].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSidebarOpen(false); // ✅ close after click
            }}
            className={`px-4 py-2 rounded-xl capitalize ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-10 px-4 py-2 bg-red-500 text-white rounded-xl"
      >
        Logout
      </button>

    </div>
  </div>
)}

{/* MAIN */}

<div className="flex-1 p-8">

{/* HEADER */}
<div className="flex justify-between items-center mb-10">

  {/* ✅ MOBILE MENU BUTTON */}
  <button
    className="md:hidden px-3 py-2 bg-indigo-600 text-white rounded-lg"
    onClick={() => setSidebarOpen(true)}
  >
    ☰
  </button>

  <div>
    <h1 className="text-3xl font-bold dark:text-white">
      Welcome, {profile?.name || "User"} 👋
    </h1>
    <p className="text-gray-500 dark:text-gray-400">
      Performance insights & analytics
    </p>
  </div>

<button
onClick={toggleTheme}
className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 dark:text-white"
>
{theme==="dark"?"☀ Light":"🌙 Dark"}
</button>

</div>

{/* ================= OVERVIEW ================= */}

{activeTab==="overview" && (

<div className="space-y-10">

{/* SUMMARY */}

<div className="grid md:grid-cols-4 gap-6">
<StatCard title="Total Exams" value={totalExams}/>
<StatCard title="Highest Score" value={highestScore}/>
<StatCard title="Average Score" value={averageScore}/>
<StatCard title="Rank" value={getRank()}/>
</div>

{/* BEST EXAM */}

{bestExam && (

<div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-2xl shadow-xl">

<h2 className="text-xl font-bold mb-2">
🥇 Best Performance
</h2>

<p className="text-lg">
Year {bestExam.examYear || bestExam.year} — Level {bestExam.examLevel || bestExam.level}
</p>

<p className="text-2xl font-bold text-indigo-600">
{bestExam.marks || bestExam.Marks} Marks
</p>

</div>

)}

{/* GRAPH */}

<div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl">

<h2 className="text-lg font-semibold mb-6 dark:text-white">
📊 Score Progress
</h2>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={progressData}>
<XAxis dataKey="year"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={3}/>
</LineChart>

</ResponsiveContainer>

</div>

{/* EXAM HISTORY */}

<div>

<h2 className="text-xl font-semibold mb-6 dark:text-white">
📚 Exam History
</h2>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{results.map((exam,index)=>{

const year = exam.examYear ?? "Not Available"
const level = exam.examLevel ?? "Not Available"
const marks = exam.marks ?? 0

return(

<motion.div
key={index}
whileHover={{scale:1.05}}
className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
>

<h3 className="text-lg font-bold text-indigo-600 mb-3">
Exam {index+1}
</h3>

<div className="space-y-2 text-gray-600 dark:text-gray-300">

<p><strong>Year:</strong> {year}</p>
<p><strong>Level:</strong> {level}</p>
<p><strong>Marks:</strong> {marks}</p>

</div>

</motion.div>
);

})}

</div>

</div>

</div>

)}

{/* ================= ANALYTICS ================= */}

{activeTab==="analytics" && (

<div className="grid md:grid-cols-2 gap-10">

<div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl">

<h2 className="text-lg font-semibold mb-6 dark:text-white">
🎯 Level Distribution
</h2>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={levelData}>
<XAxis dataKey="_id"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="count" fill="#6366f1"/>
</BarChart>

</ResponsiveContainer>

</div>

<div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl">

<h2 className="text-lg font-semibold mb-6 dark:text-white">
👥 Gender Ratio
</h2>

<ResponsiveContainer width="100%" height={300}>

<PieChart>

<Pie
data={genderData}
dataKey="count"
nameKey="_id"
outerRadius={100}
innerRadius={50}
label
>

{genderData.map((_,i)=>(
<Cell key={i} fill={i%2===0?"#6366f1":"#ec4899"}/>
))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

</div>

)}

{/* ================= PROFILE ================= */}

{activeTab==="profile" && (

<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-xl">

<h2 className="text-xl font-semibold mb-6 dark:text-white">
Profile Information
</h2>

<div className="space-y-3 dark:text-gray-300">

<p><strong>Name:</strong> {profile?.name}</p>
<p><strong>LND ID:</strong> {profile?.lndId}</p>
<p><strong>Mobile:</strong> {profile?.mobileNumber}</p>

</div>

</div>

)}

{/* ================= EXAM REGISTRATION ================= */}

{activeTab==="registration" && (

<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-xl">

<h2 className="text-xl font-semibold mb-6 dark:text-white">
Exam Registration
</h2>

{!registrationOpen ? (

  <p className="text-red-500 font-semibold">
    Registration is currently closed
  </p>

) : alreadyRegistered ? (

  <div className="text-center">
    <p className="text-green-600 text-lg font-bold">
      ✅ You have already registered for {registeredLevel}
    </p>

  </div>

) : (

<div className="space-y-4 dark:text-gray-300">

<p><strong>LND ID:</strong> {profile?.lndId}</p>
<p><strong>Name:</strong> {profile?.name}</p>
<p><strong>Age:</strong> {profile?.age}</p>
<p><strong>Gender:</strong> {profile?.gender}</p>

<select
  className="w-full p-2 rounded-lg border"
  value={level}
  onChange={(e)=>setLevel(e.target.value)}
>
<option value="Level 0">Level 0</option>
<option value="Level 1">Level 1</option>
<option value="Level 2">Level 2</option>
</select>

<div className="flex items-center gap-2">
<input
type="checkbox"
checked={wantExam}
onChange={(e)=>setWantExam(e.target.checked)}
/>
<label>I want to appear for exam</label>
</div>

<button
  onClick={handleExamRegistration}
  disabled={alreadyRegistered}
  className="px-6 py-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50"
>
  Submit
</button>

</div>

)}

</div>

)}

</div>

</div>

);

}

/* ================= STAT CARD ================= */

function StatCard({title,value}){

return(

<motion.div
whileHover={{scale:1.05}}
className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
>

<p className="text-gray-500 dark:text-gray-400 text-sm">
{title}
</p>

<h2 className="text-3xl font-bold text-indigo-600 mt-2">
{value}
</h2>

</motion.div>

);

}