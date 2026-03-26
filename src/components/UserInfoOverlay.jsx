import { useUser } from "../context/UserContext";
import "./UserInfoOverlay.css";

export default function UserInfoOverlay() {
  const { user } = useUser();

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
