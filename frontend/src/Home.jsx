import { useState, useEffect } from "react";
import axios from "axios";

function Home() {
  const [email, setEmail] = useState("");
  const [modules, setModules] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/modules")
      .then((res) => setModules(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Enter Your Email</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <h3>Available Modules</h3>
      {modules.map((m) => (
        <div key={m._id}>{m.title}</div>
      ))}
    </div>
  );
}

export default Home;