import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Caesar() {
  const navigate = useNavigate();

  // ✅ QUESTIONS
  const questions = [
    { word: "KHOOR", shift: 3, answer: "HELLO" },
    { word: "BTWQI", shift: 5, answer: "WORLD" },
    { word: "IUIK", shift: 6, answer: "CODE" },
    { word: "WSHULA", shift: 7, answer: "PLANET" },
    { word: "HNUMJW", shift: 5, answer: "CIPHER" },
    { word: "TKZCUXQ", shift: 6, answer: "NETWORK" },
    { word: "ZLJYLA", shift: 7, answer: "SECRET" },
    { word: "JDPH", shift: 3, answer: "GAME" },
    { word: "QTLNH", shift: 5, answer: "LOGIC" },
    { word: "ZVSABAPVU", shift: 7, answer: "SOLUTION" }
  ];

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0); // Start from 0
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [timeTaken, setTimeTaken] = useState(0);

  const current = questions[index];

  /* =========================
     FORMAT TIME (MM:SS)
  ========================= */
  const formatTime = (t) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  /* =========================
     TIMER (5 MINUTES MAX)
  ========================= */
  useEffect(() => {
    if (finished) return;

    if (time >= 300) { // 5 minutes max
      setFinished(true);
      setTimeTaken(300);
      setTimeout(() => navigate("/debug"), 2000);
      return;
    }

    const t = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(t);
  }, [time, finished, navigate]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = () => {
    if (finished) return;

    if (input.toUpperCase() === current.answer) {
      setScore(prev => prev + 3);
      setFeedback("✅ Correct!");
    } else {
      setScore(prev => prev - 1);
      setFeedback(`❌ ${current.answer}`);
    }

    setTimeout(() => setFeedback(""), 1200);
    setInput("");

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      setTimeTaken(time);
      setTimeout(() => navigate("/debug"), 2000);
    }
  };

  /* =========================
     GAME OVER
  ========================= */
  if (finished) {
    return (
      <div style={{
        height: "100vh",
        background: "#05070d",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h1 style={{ fontSize: "50px" }}>🎉 Game Over</h1>
        <h2 style={{ fontSize: "35px" }}>Score: {score}</h2>
        <h3>Completed: {index} / {questions.length}</h3>

        <h3 style={{ color: "#00ffff", marginTop: "10px" }}>
          ⏱ Time Taken: {formatTime(timeTaken)}
        </h3>
        <p style={{ color: "#00ffffaa", marginTop: "10px" }}>
          Redirecting to Debug page...
        </p>
      </div>
    );
  }

  /* =========================
     MAIN UI
  ========================= */
  return (
    <div style={{
      height: "100vh",
      background: "#05070d",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "monospace"
    }}>

      {/* TOP BAR */}
      <div style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 40px"
      }}>
        <h2>⏱ {formatTime(time)}</h2>
        <h2>⭐ {score}</h2>
      </div>

      {/* CENTER */}
      <div style={{ textAlign: "center" }}>
        <h2>Word {index + 1} / {questions.length}</h2>
        <h3 style={{ color: "#00ffff", marginBottom: "20px" }}>
          Shift: {current.shift}
        </h3>

        {/* LETTER BOXES */}
        <div style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          marginBottom: "30px"
        }}>
          {current.word.split("").map((letter, i) => (
            <div key={i} style={{
              width: "70px",
              height: "70px",
              border: "3px solid #00ffff",
              background: "#0a0f1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#00ffff"
            }}>
              {letter}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TYPE ANSWER"
          style={{
            padding: "15px",
            fontSize: "20px",
            width: "320px",
            textAlign: "center",
            border: "2px solid cyan",
            background: "#000",
            color: "#00ffff",
            outline: "none"
          }}
        />

        <br /><br />

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          style={{
            padding: "14px 35px",
            fontSize: "18px",
            background: "#00ffff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          SUBMIT
        </button>

        {/* FEEDBACK */}
        <p style={{
          marginTop: "20px",
          fontSize: "20px",
          color: feedback.includes("Correct") ? "#00ff00" : "#ff4444"
        }}>
          {feedback}
        </p>

      </div>

      {/* BOTTOM A-Z + NUMBERS */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "15px"
      }}>

        {/* LETTERS */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px",
          maxWidth: "900px"
        }}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => (
            <span key={letter} style={{
              padding: "6px 10px",
              border: "1px solid #00ffff55",
              color: "#00ffffaa",
              fontSize: "14px"
            }}>
              {letter}
            </span>
          ))}
        </div>

        {/* NUMBERS */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px",
          marginTop: "5px",
          maxWidth: "900px"
        }}>
          {Array.from({ length: 26 }, (_, i) => i + 1).map(num => (
            <span key={num} style={{
              padding: "4px 10px",
              color: "#ffffff88",
              fontSize: "12px"
            }}>
              {num}
            </span>
          ))}
        </div>

      </div>

    </div>
  );
}