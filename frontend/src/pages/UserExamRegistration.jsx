import React, { useEffect, useState } from "react";

const UserExamRegistration = () => {
  const [user, setUser] = useState(null);
  const [level, setLevel] = useState(0);
  const [willAppear, setWillAppear] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    fetch("https://dharmik-pariksha.onrender.com/api/admin/registration-status")
      .then(res => res.json())
      .then(data => setIsOpen(data.isOpen));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      "https://dharmik-pariksha.onrender.com/api/user/register-exam",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          lndId: user.lndId,
          name: user.name,
          age: user.age,
          gender: user.gender,
          level,
          willAppear
        })
      }
    );

    const data = await res.json();
    setMessage(data.message);
  };

  if (!isOpen) {
    return <h2>Registration Closed ❌</h2>;
  }

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Exam Registration</h2>

      <form onSubmit={handleSubmit}>
        <p><b>LNDID:</b> {user.lndId}</p>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Age:</b> {user.age}</p>
        <p><b>Gender:</b> {user.gender}</p>
        <p><b>Year:</b> {new Date().getFullYear()}</p>

        <label>Select Level:</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value={0}>Basic Level</option>
          <option value={1}>Level 1</option>
          <option value={2}>Level 2</option>
          <option value={3}>Level 3</option>
        </select>

        <br /><br />

        <label>Will you appear?</label>
        <select
          value={willAppear}
          onChange={(e) => setWillAppear(e.target.value === "true")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <br /><br />

        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UserExamRegistration;