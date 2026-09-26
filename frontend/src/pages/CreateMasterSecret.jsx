import { useNavigate } from "react-router-dom";

export default function CreateMasterSecret() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <h1>Protéger votre coffre</h1>
      <p>Vous devez d'abord créer un mot de passe maître pour votre coffre Secure Agent.</p>
      <div className="setup-choice">
        <button type="button" onClick={() => navigate("/setup-master/pin")}>
          Utiliser un code PIN
        </button>
        <button type="button" onClick={() => navigate("/setup-master/password")}>
          Utiliser un mot de passe
        </button>
      </div>
    </div>
  );
}