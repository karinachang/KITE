import React, { useState, useEffect } from "react";
import "../CSS/Home.css";
import { getDummyData } from "../Data/dataService.js";

function Home() {
  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        window.location.href = "./access";
      }, 2000);

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [redirect]); // useEffect will run when `redirect` state changes

  const handleCodeSubmit = () => {
    const data = getDummyData();
    const record = data.find((item) => item.hash === code);

    if (record) {
      setIsCodeValid(true);
      setPasswordRequired(record.password !== null);
      if (record.password === null) {
        // Directly redirect here for cases where no password is needed
        window.location.href = `/access/${record.hash}`;
      }
    } else {
      alert("Invalid code");
    }
  };


  const handlePasswordSubmit = async () => {
    const data = getDummyData();
    const record = data.find((item) => item.hash === code);

    if (record && password === record.password) {
      // Record the successful password entry. Consider hashing.
      sessionStorage.setItem(`access_granted_${code}`, true);
      window.location.href = `/access/${code}`;
    } else {
      alert("Invalid password");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <a href="./home" className="kite-link">
          KITE
        </a>
        <button
          onClick={() => (window.location.href = "./upload")}
          className="Upload-button"
        >
          UPLOAD
        </button>
      </header>

      <main className="App-main">
        {!isCodeValid ? (
          <div className="code-input-container">
            <label htmlFor="code-input" className="code-input-label">
              Enter your 6-digit code:
            </label>
            <input
              id="code-input"
              className="code-input-field"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
            />

            <div className="dashed-line"></div>
            <button className="access-file-button" onClick={handleCodeSubmit}>
              ACCESS FILES
            </button>
          </div>
        ) : passwordRequired ? (
          <div className="password-input-container">
            <label htmlFor="password-input" className="code-input-label" id="password-input-box">
              Enter password:
            </label>
            <input
              id="password-input"
              className="code-input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            />

            <button
              className="access-file-button"
              onClick={handlePasswordSubmit}
            >
              ACCESS FILES
            </button>
          </div>
        ) : (
          <div className="file-accessing-container">
            <p>Accessing your files...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;