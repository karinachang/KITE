import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import "../CSS/Uploaded.css";

const Uploaded = () => {
  const [code, setCode] = useState("318278");
  const [showQR, setShowQR] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(interval);
          setUploadComplete(true);
          return 100;
        }
        return Math.min(oldProgress + 20, 100); // increment by 20% every second
      });
    }, 1000); // 1000 milliseconds = 1 second

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const copyLinkToClipboard = () => {
    const baseUrl = window.location.origin;
    navigator.clipboard.writeText(`${baseUrl}/access/${code}`);
  };
  
  const getLink = () => {
    return `${window.location.origin}/${code}`;
  };

  return (
    <div className="upload-container">
      <header className="App-header">
        <a href="./home" className="kite-link">
          KITE
        </a>
      </header>
      
      {!uploadComplete && (
        <>
          <div className="progress-bar">
            <div
              className={`progress ${uploadComplete ? "progress-complete" : ""}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </>
      )}
      {uploadComplete && (
        <>
          <div className="code-box">{code}</div>
          {!showQR && <QRCode value={getLink()} />}
          <div className="button-container">
            <button onClick={copyCodeToClipboard}><span class="material-symbols-outlined">content_copy</span></button>
            <button onClick={copyLinkToClipboard}><span class="material-symbols-outlined">link</span></button>
          </div>
        </>
      )}
    </div>
  );
};

export default Uploaded;
