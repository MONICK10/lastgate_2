import { useUser } from "../context/UserContext";
import { useLocation } from "react-router-dom";
import "./UserInfoOverlay.css";

export default function UserInfoOverlay() {
  const { user } = useUser();
  const location = useLocation();

  // Hide overlay on Home, Intro, and Complete pages - only show when user has entered name
  const hidePages = ["/", "/intro", "/complete"];
  const shouldHide = hidePages.includes(location.pathname) || !user.name;

  if (shouldHide) {
    return null;
  }

  return (
    <div className="user-info-overlay">
      <div className="user-info-content">
        <p className="user-info-line">
          <span className="user-info-label">👤 Name:</span>
          <span className="user-info-value">{user.name || "—"}</span>
        </p>
        <p className="user-info-line">
          <span className="user-info-label">🆔 Reg:</span>
          <span className="user-info-value">{user.registerNumber || "—"}</span>
        </p>
        <p className="user-info-line score">
          <span className="user-info-label">⭐ Score:</span>
          <span className="user-info-value score-value">{user.totalScore || 0}</span>
        </p>
      </div>
    </div>
  );
}
