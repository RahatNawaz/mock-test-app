import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (id === "admin" && password === "1234") {
      navigate("/admin");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Login</h2>
      <input
        placeholder="ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default AdminLogin;