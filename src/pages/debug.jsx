import { useState, useEffect } from "react";

export default function Debug() {

  const questions = [
    {
      title: "LAN vs WAN Decision",
      correct: [
        "network = input()",
        "if network == 'LAN':",
        "    print('Private Communication')",
        "else:",
        "    print('Public Communication')"
      ],
      scrambled: [
        "    print('Public Communication')",
        "network = input()",
        "else:",
        "if network == 'LAN':",
        "    print('Private Communication')"
      ]
    },
    {
      title: "VLAN Assignment",
      correct: [
        "vlan = int(input())",
        "if vlan == 10:",
        "    print('Dept A')",
        "elif vlan == 20:",
        "    print('Dept B')"
      ],
      scrambled: [
        "    print('Dept B')",
        "elif vlan == 20:",
        "vlan = int(input())",
        "if vlan == 10:",
        "    print('Dept A')"
      ]
    },
    {
      title: "OSPF Neighbor Status",
      correct: [
        "n = int(input())",
        "if n > 0:",
        "    print('Connected')",
        "else:",
        "    print('Disconnected')"
      ],
      scrambled: [
        "    print('Disconnected')",
        "else:",
        "n = int(input())",
        "if n > 0:",
        "    print('Connected')"
      ]
    },
    {
      title: "IP Type Check",
      correct: [
        "ip = input()",
        "if ip.startswith('192.168'):",
        "    print('Private IP')",
        "else:",
        "    print('Public IP')"
      ],
      scrambled: [
        "    print('Public IP')",
        "ip = input()",
        "else:",
        "if ip.startswith('192.168'):",
        "    print('Private IP')"
      ]
    },
    {
      title: "NAT Decision",
      correct: [
        "inside = input()",
        "if inside == 'yes':",
        "    print('Apply NAT')",
        "else:",
        "    print('No NAT')"
      ],
      scrambled: [
        "    print('No NAT')",
        "inside = input()",
        "else:",
        "if inside == 'yes':",
        "    print('Apply NAT')"
      ]
    }
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [lines, setLines] = useState(questions[0].scrambled);

  const [scores, setScores] = useState(Array(5).fill(0));
  const [submitted, setSubmitted] = useState(Array(5).fill(false));
  const [timeTaken, setTimeTaken] = useState(Array(5).fill(0));

  const [time, setTime] = useState(0); // ⏱ START FROM 0
  const [feedback, setFeedback] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  /* =========================
     TIMER (COUNT UP)
  ========================= */
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(t);
  }, [currentQ]);

  /* =========================
     LOAD QUESTION
  ========================= */
  const loadQuestion = (i) => {
    setCurrentQ(i);
    setLines(questions[i].scrambled);
    setTime(0); // reset timer
    setFeedback("");
  };

  /* =========================
     DRAG & DROP
  ========================= */
  const handleDragStart = (i) => setDragIndex(i);

  const handleDrop = (i) => {
    if (dragIndex === null) return;

    const newLines = [...lines];
    const item = newLines[dragIndex];

    newLines.splice(dragIndex, 1);
    newLines.splice(i, 0, item);

    setLines(newLines);
    setDragIndex(null);
  };

  /* =========================
     RUN
  ========================= */
  const handleRun = () => {
    const correct = questions[currentQ].correct;
    const isCorrect = JSON.stringify(lines) === JSON.stringify(correct);

    setFeedback(isCorrect ? "✅ Looks Correct!" : "⚠️ Incorrect Logic");
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = () => {
    if (submitted[currentQ]) return;

    const correct = questions[currentQ].correct;
    const isCorrect = JSON.stringify(lines) === JSON.stringify(correct);

    const newScores = [...scores];
    const newSubmitted = [...submitted];
    const newTimes = [...timeTaken];

    newScores[currentQ] = isCorrect ? 10 : 0;
    newSubmitted[currentQ] = true;
    newTimes[currentQ] = time;

    setScores(newScores);
    setSubmitted(newSubmitted);
    setTimeTaken(newTimes);

    setFeedback(isCorrect ? "🎉 Correct! +10" : "❌ Wrong! 0 Marks");
  };

  const solvedCount = scores.filter(s => s === 10).length;

  /* =========================
     FINAL SCREEN
  ========================= */
  if (solvedCount === 5) {
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
        <h1 style={{ fontSize: "50px" }}>🔥 PROBLEM SOLVED</h1>
        <h2>Total Score: {scores.reduce((a,b)=>a+b,0)}</h2>

        {timeTaken.map((t, i) => (
          <p key={i}>
            Q{i+1}: {scores[i] === 10 ? "✅" : "❌"} | Time: {t}s
          </p>
        ))}
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#05070d",
      color: "white"
    }}>

      {/* LEFT */}
      <div style={{ flex: 3, padding: "20px" }}>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>⏱ {time}s</h2>
          <h2>⭐ {scores.reduce((a,b)=>a+b,0)}</h2>
        </div>

        <h3>{questions[currentQ].title}</h3>
        <p style={{ color: "#00ffff" }}>
          Drag → Declaration → Condition → Statement
        </p>

        {/* CODE */}
        <div style={{
          background: "#0a0f1c",
          padding: "20px",
          border: "2px solid cyan"
        }}>
          {lines.map((line, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={() => handleDrop(i)}
              style={{
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #00ffff55",
                background: "#111",
                cursor: "grab"
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleRun}>▶ Run</button>
          <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>
            ✔ Submit
          </button>
        </div>

        <p style={{ marginTop: "15px" }}>{feedback}</p>

        <h3>Progress: {solvedCount} / 5</h3>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        borderLeft: "2px solid cyan",
        padding: "20px"
      }}>
        <h3>Questions</h3>

        {questions.map((_, i) => (
          <div
            key={i}
            onClick={() => loadQuestion(i)}
            style={{
              padding: "10px",
              marginBottom: "10px",
              cursor: "pointer",
              background:
                scores[i] === 10 ? "#00ff0055" :
                submitted[i] ? "#ff000055" :
                "#111"
            }}
          >
            Q{i+1}
          </div>
        ))}
      </div>

    </div>
  );
}