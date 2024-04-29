import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS/Uploaded.css";

const Uploaded = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (location.state?.hash) {
      setCode(location.state.hash);
      setPassword(location.state.password);
    } else {
      navigate("/no-upload-detected");
      return;
    }

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + 20, 100);
        if (newProgress === 100) {
          clearInterval(interval);
          setUploadComplete(true);
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location.state, navigate]);

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const copyLinkToClipboard = () => {
    const baseUrl = window.location.origin;
    const filesMessage =
      location.state.numberofFiles > 1 ? "Get the files:" : "Get the file:";
    const linkText = `${filesMessage} ${baseUrl}/access/${code}`;
    const message = password ? `${linkText}\nPassword: ${password}` : linkText;
    navigator.clipboard.writeText(message);
  };

  const getLink = () => `${window.location.origin}/access/${code}`;

  return (
    <div className="upload-container">
      <header className="App-header">
        <a href="./home" className="kite-link">
          <img
            src={window.location.origin + "/Images/logo2white.png"}
            alt="KITE"
            className="kite-logo"
          ></img>
        </a>
      </header>

      {!uploadComplete ? (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      ) : (
        <>
          <div className="code-box">{code}</div>
          {/* Conditionally render the password box if a password exists */}
          {password && (
            <div className="password-box">
              <div className="password-content">
                <span className="password-text">
                  Password: {isPasswordVisible ? password : "••••••"}
                </span>
                <span
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="material-symbols-outlined password-toggle"
                >
                  {isPasswordVisible ? "visibility_off" : "visibility"}
                </span>
              </div>
            </div>
          )}
          <QRCode value={getLink()} />
          <div className="button-container">
            <button onClick={copyCodeToClipboard}>
              <span className="material-symbols-outlined">content_copy</span>
            </button>
            <button onClick={copyLinkToClipboard}>
              <span className="material-symbols-outlined">link</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Uploaded;
