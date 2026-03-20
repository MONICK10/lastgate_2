import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#00ff00',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '40px', textShadow: '0 0 20px #00ff00' }}>
        Hawkins Protocol
      </h1>
      <button 
        onClick={() => navigate("/intro")}
        style={{
          padding: '15px 40px',
          fontSize: '18px',
          backgroundColor: '#00ff00',
          color: '#000',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 0 15px #00ff00',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 0 30px #00ff00';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 0 15px #00ff00';
          e.target.style.transform = 'scale(1)';
        }}
      >
        Start Mission
      </button>
    </div>
  );
}
