import React, { useState, useEffect } from "react";
import "../CSS/Home.css";

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
    //Dummy code. Connect it to backend and apply logic.
    if (code === "123456") {
      setIsCodeValid(true);
      setPasswordRequired(true);
    } else if (code === "318278") {
      setIsCodeValid(true);
      setPasswordRequired(false);
      setRedirect(true); // Set redirect to true
      // Implement logic here for accessing the file without a password
    } else {
      alert("Invalid code");
    }
  };

  const handlePasswordSubmit = () => {
    //Dummy code. Connect it to backend and apply logic.
    if (password === "123456") {
      alert("Access Granted"); // Replace with file access logic
    } else {
      alert("Invalid password"); // Replace with error handling
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
          Upload
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
            <label htmlFor="password-input" className="code-input-label">
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
