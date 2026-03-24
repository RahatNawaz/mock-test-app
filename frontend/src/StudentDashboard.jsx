import { useState, useEffect } from "react";
import axios from "axios";

function StudentDashboard({ email: initialEmail, onLogout }) {
  const [email, setEmail] = useState(initialEmail || "");
  const [registered, setRegistered] = useState(false);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (registered) fetchModules();
  }, [registered]);

  // Registration / Login
  const registerStudent = async () => {
    if (!email) return alert("Enter your email");
    const res = await axios.get("http://localhost:5050/students/check", { params: { email } });
    if (res.data.exists) return alert("Email already registered! Please login instead.");
    await axios.post("http://localhost:5050/students", { email });
    setRegistered(true);
  };

  const loginStudent = async () => {
    if (!email) return alert("Enter your email");
    const res = await axios.get("http://localhost:5050/students/check", { params: { email } });
    if (!res.data.exists) return alert("Email not registered. Please register first.");
    setRegistered(true);
  };

  // Fetch modules
  const fetchModules = () => axios.get("http://localhost:5050/modules").then(res => setModules(res.data));

  // Select module
  const selectModule = module => {
    setSelectedModule(module);
    axios.get(`http://localhost:5050/questions/${module._id}`).then(res => {
      setQuestions(res.data);
      setAnswers(new Array(res.data.length).fill(""));
    });
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitTest = async () => {
    if (answers.includes("")) return alert("Please answer all questions");
    const res = await axios.post("http://localhost:5050/attempts/submit", {
      studentEmail: email,
      moduleId: selectedModule._id,
      answers
    });
    const questionsWithSelected = questions.map((q, idx) => ({
      ...q,
      selectedAnswer: answers[idx]
    }));
    setResult({
      marks: res.data.marks,
      totalQuestions: res.data.totalQuestions,
      questions: questionsWithSelected
    });
  };

  // -------------------------- STYLES --------------------------
  const containerStyle = { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: "Arial, sans-serif", backgroundColor: "#f7f7f7", padding: "20px" };
  const cardStyle = { width: "90%", maxWidth: "700px", backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0px 8px 20px rgba(0,0,0,0.1)", marginTop: "20px" };
  const buttonStyle = { padding: "10px 20px", margin: "5px", borderRadius: "6px", border: "none", backgroundColor: "#4CAF50", color: "#fff", fontSize: "1em", cursor: "pointer" };
  const logoutButtonStyle = { padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#f44336", color: "#fff", cursor: "pointer" };
  const inputStyle = { padding: "10px", width: "80%", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1em" };
  const questionStyle = { marginTop: "15px", padding: "10px", borderBottom: "1px solid #eee" };
  const choiceStyle = { display: "block", marginTop: "5px" };
  const marksStyle = { fontSize: "2em", fontWeight: "bold", margin: "20px 0" };

  // -------------------------- RENDER FLOW --------------------------
  if (!registered) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center" }}>Student Portal</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <div style={{ textAlign: "center" }}>
            <button onClick={loginStudent} style={buttonStyle}>Login</button>
            <button onClick={registerStudent} style={buttonStyle}>Register</button>
          </div>
        </div>
      </div>
    );
  }

  // Top bar with Logout and Marks
  const topBar = result ? (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "20px" }}>
      <button onClick={onLogout} style={logoutButtonStyle}>Logout</button>
      <div style={marksStyle}>{result.marks} / {result.totalQuestions}</div>
    </div>
  ) : null;

  // Result page
  if (selectedModule && result) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {topBar}
          <h2 style={{ textAlign: "center" }}>Module: {selectedModule.title}</h2>
          <button style={buttonStyle} onClick={() => { setSelectedModule(null); setResult(null); }}>Back to Modules</button>

          {result.questions.map((q, idx) => (
            <div key={q._id} style={questionStyle}>
              <p>{idx + 1}. {q.question}</p>
              <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                {q.choices.map((choice, i) => {
                  let style = {};
                  if (choice === q.selectedAnswer && choice !== q.correctAnswer) style = { color: "red", fontWeight: "bold" };
                  else if (choice === q.correctAnswer) style = { color: "green", fontWeight: "bold" };
                  return <li key={i} style={style}>{choice}</li>;
                })}
              </ul>
              <p>
                Your answer: <span style={{ color: q.selectedAnswer === q.correctAnswer ? "green" : "red", fontWeight: "bold" }}>{q.selectedAnswer || "Not answered"}</span> &nbsp; | &nbsp;
                Correct answer: <span style={{ color: "green", fontWeight: "bold" }}>{q.correctAnswer}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Test page
  if (selectedModule) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {topBar}
          <h2 style={{ textAlign: "center" }}>Module: {selectedModule.title}</h2>
          <button style={buttonStyle} onClick={() => { setSelectedModule(null); setResult(null); }}>Back to Modules</button>

          {questions.map((q, idx) => (
            <div key={q._id} style={questionStyle}>
              <p>{idx + 1}. {q.question}</p>
              {q.choices.map((c, i) => (
                <label key={i} style={choiceStyle}>
                  <input
                    type="radio"
                    name={`q${idx}`}
                    value={c}
                    checked={answers[idx] === c}
                    onChange={() => handleAnswerChange(idx, c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          ))}

          <button style={buttonStyle} onClick={submitTest}>Submit Test</button>
        </div>
      </div>
    );
  }

  // Module selection page
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Welcome, {email}</h2>
          <button onClick={onLogout} style={logoutButtonStyle}>Logout</button>
        </div>
        <h3 style={{ textAlign: "center" }}>Select a module to start the test:</h3>
        {modules.map((m) => (
          <div key={m._id} style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
            <button onClick={() => selectModule(m)} style={buttonStyle}>{m.title}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;