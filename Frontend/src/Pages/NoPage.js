import React from "react";
import "../CSS/NoPage.css";

const NoPage = () => {
  return (
    <div>
      <header className="App-header">
          <div>
            <a href="./home" className="kite-link">
              <img
                src={window.location.origin + "/Images/logo2white.png"}
                alt="KITE"
                className="kite-logo"
              ></img>
            </a>
          </div>
        </header>

      <div className="no-page-container">
        <h1>404</h1>
        <p>PAGE NOT FOUND</p>
      </div>
    </div>
  );
};

export default NoPage;