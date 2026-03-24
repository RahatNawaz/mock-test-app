import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

function App() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  const handleLogout = () => {
    setRole("");
    setEmail("");
  };

  // Shared styles (same as StudentDashboard)
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    fontFamily: "Arial, sans-serif"
  };

  const cardStyle = {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "350px"
  };

  const buttonStyle = {
    width: "100%",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1.2em",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    color: "#fff"
  };

  if (!role) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ marginBottom: "20px" }}>Mock Test System</h1>
          <p>Select your role to continue</p>

          <button onClick={() => setRole("admin")} style={buttonStyle}>
            Admin Panel
          </button>

          <button onClick={() => setRole("student")} style={buttonStyle}>
            Student Portal
          </button>
        </div>
      </div>
    );
  }

  if (role === "admin") {
    return <AdminDashboard setRole={setRole} />;
  }

  if (role === "student") {
    return (
      <StudentDashboard
        email={email}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default App;