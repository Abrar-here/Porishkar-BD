import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [status, setStatus] = useState("Checking connection...");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/health")
      .then((res) => {
        setStatus(res.data.message);
      })
      .catch((err) => {
        setStatus("Could not connect to backend: " + err.message);
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">PorishkarBD</h1>
        <p className="text-xl text-white">{status}</p>
      </div>
    </div>
  );
}

export default App;
