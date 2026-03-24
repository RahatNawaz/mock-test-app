import { useState, useEffect } from "react";
import axios from "axios";

function AdminDashboard({ setRole }) {
  const [title, setTitle] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const [studentsCount, setStudentsCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [summary, setSummary] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const [editingQuestionId, setEditingQuestionId] = useState(null);

  useEffect(() => {
    fetchModules();
    fetchStats();
  }, []);

  const fetchModules = () => {
    axios.get("http://localhost:5050/modules").then((res) => setModules(res.data));
  };

  const fetchStats = () => {
    axios.get("http://localhost:5050/students/count").then((res) => setStudentsCount(res.data.count));
    axios.get("http://localhost:5050/attempts/count").then((res) => setAttemptsCount(res.data.count));
  };

  const fetchSummary = () => {
    axios.get("http://localhost:5050/attempts/summary").then((res) => setSummary(res.data));
    setShowSummary(true);
  };

  const createModule = async () => {
    if (!title) return alert("Enter module title");
    await axios.post("http://localhost:5050/modules", { title });
    setTitle("");
    fetchModules();
  };

  const deleteModule = async (id) => {
    if (!window.confirm("Delete module?")) return;
    await axios.delete(`http://localhost:5050/modules/${id}`);
    fetchModules();
  };

  const selectModule = (module) => {
    setSelectedModule(module);
    axios.get(`http://localhost:5050/questions/${module._id}`).then((res) => setQuestions(res.data));
  };

  const handleChoiceChange = (index, value) => {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  };

  const addQuestion = async () => {
    if (!newQuestion || choices.some(c => !c) || !correctAnswer) {
      return alert("Fill all fields");
    }

    if (editingQuestionId) {
      await axios.put(`http://localhost:5050/questions/${editingQuestionId}`, {
        question: newQuestion,
        choices,
        correctAnswer
      });
      setEditingQuestionId(null);
    } else {
      await axios.post("http://localhost:5050/questions", {
        moduleId: selectedModule._id,
        question: newQuestion,
        choices,
        correctAnswer
      });
    }

    setNewQuestion("");
    setChoices(["", "", "", ""]);
    setCorrectAnswer("");
    fetchModules();
    selectModule(selectedModule);
  };

  const editQuestion = (q) => {
    setEditingQuestionId(q._id);
    setNewQuestion(q.question);
    setChoices(q.choices);
    setCorrectAnswer(q.correctAnswer);
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete question?")) return;
    await axios.delete(`http://localhost:5050/questions/${id}`);
    selectModule(selectedModule);
  };

  // ===== STYLES =====
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    fontFamily: "Arial"
  };

  const cardStyle = {
    width: "90%",
    maxWidth: "800px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.1)"
  };

  const buttonStyle = {
    padding: "10px 20px",
    margin: "5px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer"
  };

  const dangerButton = {
    ...buttonStyle,
    backgroundColor: "#f44336"
  };

  const inputStyle = {
    padding: "10px",
    marginTop: "5px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Top Bar */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Admin Dashboard</h2>
          <button onClick={() => setRole("")} style={dangerButton}>
            Logout
          </button>
        </div>

        <p><b>Students:</b> {studentsCount}</p>
        <p>
          <b>Attempts:</b> {attemptsCount}
          <button onClick={fetchSummary} style={buttonStyle}>Summary</button>
        </p>

        {showSummary && (
          <div>
            <h3>Summary</h3>
            <table border="1" width="100%">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Module</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s, i) => (
                  <tr key={i}>
                    <td>{s.studentEmail}</td>
                    <td>{s.moduleTitle}</td>
                    <td>{s.marks}/{s.totalQuestions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!selectedModule && (
          <>
            <h3>Create Module</h3>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module Title"
              style={inputStyle}
            />
            <button onClick={createModule} style={buttonStyle}>Add</button>

            <h3>Modules</h3>
            {modules.map((m) => (
              <div key={m._id}>
                {m.title}
                <button onClick={() => selectModule(m)} style={buttonStyle}>Open</button>
                <button onClick={() => deleteModule(m._id)} style={dangerButton}>Delete</button>
              </div>
            ))}
          </>
        )}

        {selectedModule && (
          <>
            <h3>{selectedModule.title}</h3>
            <button onClick={() => setSelectedModule(null)} style={buttonStyle}>
              Back
            </button>

            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question"
              style={inputStyle}
            />

            {choices.map((c, i) => (
              <input
                key={i}
                value={c}
                onChange={(e) => handleChoiceChange(i, e.target.value)}
                placeholder={`Choice ${i + 1}`}
                style={inputStyle}
              />
            ))}

            <input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Correct Answer"
              style={inputStyle}
            />

            <button onClick={addQuestion} style={buttonStyle}>
              {editingQuestionId ? "Update" : "Add"}
            </button>

            {questions.map((q) => (
              <div key={q._id}>
                <p>{q.question}</p>
                <button onClick={() => editQuestion(q)} style={buttonStyle}>Edit</button>
                <button onClick={() => deleteQuestion(q._id)} style={dangerButton}>Delete</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;