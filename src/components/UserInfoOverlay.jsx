import { useUser } from "../context/UserContext";
import "./UserInfoOverlay.css";

export default function UserInfoOverlay() {
  const { user } = useUser();

  // Don't show if user data is empty
  if (!user.name && !user.registerNumber) {
    return null;
  }

  return (
    <div className="user-info-overlay">
      <div className="user-info-content">
        <p className="user-info-line">
          <span className="user-info-label">Name:</span>
          <span className="user-info-value">{user.name}</span>
        </p>
        <p className="user-info-line">
          <span className="user-info-label">Reg No:</span>
          <span className="user-info-value">{user.registerNumber}</span>
        </p>
      </div>
    </div>
  );
}
