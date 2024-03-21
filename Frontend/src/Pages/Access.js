import React, { useState } from "react";
import "../CSS/Access.css";

function Access() {
  const [accessNumber, setAccessNumber] = useState("318278");

  const handleDownloadClick = () => {
      downloadFile('https://storage.googleapis.com/kitebucket/testfolder/heeyaw.png', 'test.js')
  };

  const calculateNumberFiles = () => {
    return 127;
  }

  const calculateTotalSize = () => {
    const totalBytes = 1009283470;

    if (totalBytes >= 1e9) {
      // GB
      return (totalBytes / 1e9).toFixed(2) + " GB";
    } else if (totalBytes >= 1e6) {
      // MB
      return (totalBytes / 1e6).toFixed(2) + " MB";
    } else if (totalBytes >= 1e3) {
      // KB
      return (totalBytes / 1e3).toFixed(2) + " KB";
    } else {
      // Bytes
      return totalBytes + " bytes";
    }
  };

  const downloadFile = (url, fileName) => {
      fetch(url, { method: "get", mode: "no-cors", referrerPolicy: "no-referrer" })
        .then((res) => res.blob())
        .then((res) => {
            const aElement = document.createElement("a");
            aElement.setAttribute("download", fileName);
            const href = URL.createObjectURL(res);
            aElement.href = href;
            aElement.setAttribute("target", "_blank");
            aElement.click();
            console.log(url);
            console.log(res);
            console.log(href);
            URL.revokeObjectURL(href);
        });
  };

  return (
    <div className="access-container">
      <div>
        <a href="./home" className="kite-link">KITE</a>
        <button onClick={() => (window.location.href = "./upload")} className="Upload-button">UPLOAD</button>
      </div>
      <div className="access-number">{accessNumber}</div>
      <div className="stats">
        Number of Files:{" "}
        <span className="stat-color">{calculateNumberFiles()}</span>
        <br></br>
        Total Size:{" "}
        <span className="stat-color">{calculateTotalSize()}</span>
      </div>
      <button className="download-button" onClick={handleDownloadClick}>DOWNLOAD ZIP</button>
    </div>
  );
}

export default Access;