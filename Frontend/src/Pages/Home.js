import React, { useState, useEffect } from "react";
import "../CSS/Home.css";


function Home() {
  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [record, setRecord] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        window.location.href = "./access";
      }, 2000);

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [redirect]); // useEffect will run when `redirect` state changes

  const handleCodeSubmit = () => {
    console.log(code);
    fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: code }),
    })
      .then((resp) => {
        resp
          .json()
          .then((json) => {
            console.log(json);
            if (json.length !== 0) {
              setRecord(json);
              setIsCodeValid(true);
              setPasswordRequired(json.password !== null);
              console.log("this is password before if: " + json.password);
              if (json.password === null) {
                // Directly redirect here for cases where no password is needed
                window.location.href = `/access/${code}`;
              } else {
                setPassword(json.password);
              }
            } else {
              alert("Invalid code");
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handlePasswordSubmit = async () => {
    if (record && password === record.password) {
      // Record the successful password entry. Consider hashing.
      sessionStorage.setItem(`access_granted_${record.hash}`, true);
      window.location.href = `/access/${record.hash}`;
    } else {
      console.log("this is record.password in handlePasswordSubmit: " + record.password);
      console.log("this is password in handlePasswordSubmit: " + password);
      alert("Invalid password");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <a href="./home" className="kite-link">
          <img
            src={window.location.origin + "/Images/logo2white.png"}
            alt="KITE"
            className="kite-logo"
          ></img>
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
            <label
              htmlFor="password-input"
              className="code-input-label"
              id="password-input-box"
            >
              Enter password:
            </label>
            <div className="input-with-icon">
              <input
                id="password-input"
                className="code-input-field"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
              <span
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="material-symbols-outlined visibility-toggle"
                style={{ cursor: "pointer" }}
              >
                {isPasswordVisible ? "visibility_off" : "visibility"}
              </span>
            </div>
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
