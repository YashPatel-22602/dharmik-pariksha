import { useEffect, useState } from "react";
import api from "../services/api";

export default function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get("/results/my-results").then(res => {
      setResults(res.data.results);
    });
  }, []);

  return (
    <div>
      <h2>My Results</h2>
      {results.map((r, i) => (
        <div key={i}>
          <p>Subject: {r.subject}</p>
          <p>Marks: {r.marks}</p>
        </div>
      ))}
    </div>
  );
}
