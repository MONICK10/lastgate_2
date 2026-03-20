import { useNavigate } from "react-router-dom";
import "./Intro.css";
export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-screen">
      <video
        src="/assets/intro.mp4"
        autoPlay
        playsInline
        onEnded={() => navigate("/mission/task1")}
      />
    </div>
  );
}
