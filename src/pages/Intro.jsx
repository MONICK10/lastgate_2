import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./Intro.css";

export default function Intro() {
  const [phase, setPhase] = useState("loop"); 
  const [name, setName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");

  const logoRef = useRef(null);
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const handleStart = () => {
    setPhase("logo");
  };

  const handleLogoEnd = () => {
    setPhase("intro");
  };

  const handleIntroEnd = () => {
    setPhase("form");
  };

  const handleSkip = () => {
    setPhase("form");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(name, registerNumber);
    setPhase("lastgate");
  };

  const handleLastgateEnd = () => {
    navigate("/mission/task1");
  };

  return (
    <div className="intro-screen">

      {/* PHASE 1 - LOOP VIDEO */}
      {phase === "loop" && (
        <>
          <video
            src="/assets/loop.mp4"
            autoPlay
            loop
            playsInline
            className="video"
          />

          <button className="start-btn" onClick={handleStart}>
            ENTER THE GATE
          </button>
        </>
      )}

      {/* PHASE 2 - LOGO VIDEO */}
      {phase === "logo" && (
        <video
          ref={logoRef}
          src="/assets/logo.mp4"
          autoPlay
          playsInline
          onEnded={handleLogoEnd}
          className="video"
        />
      )}

      {/* PHASE 3 - INTRO VIDEO */}
      {phase === "intro" && (
        <>
          <video
            src="/assets/intro.mp4"
            autoPlay
            playsInline
            onEnded={handleIntroEnd}
            className="video"
          />

          <button className="skip-btn" onClick={handleSkip}>
            SKIP INTRO
          </button>
        </>
      )}

      {/* PHASE 4 - FORM SCREEN */}
      {phase === "form" && (
        <div className="form-screen">
          <img src="/assets/bg2.png" alt="bg" className="bg-image" />

          <form className="form-box" onSubmit={handleSubmit}>
            <h2>ENTER YOUR DETAILS</h2>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Enter your register number"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              required
            />

            <button type="submit">START MISSION</button>
          </form>
        </div>
      )}

      {/* PHASE 5 - LASTGATE VIDEO */}
      {phase === "lastgate" && (
        <>
          <video
            src="/assets/lastgate.mp4"
            autoPlay
            playsInline
            onEnded={handleLastgateEnd}
            className="video"
          />

          <button className="skip-btn" onClick={handleLastgateEnd}>
            SKIP LASTGATE
          </button>
        </>
      )}
    </div>
  );
}