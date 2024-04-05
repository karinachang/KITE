import React, { useState, useEffect } from "react";
import "../CSS/Access.css";
import { useParams, useNavigate } from "react-router-dom"; // Import added here
import { getDummyData } from "../Data/dataService.js";
import { Link } from "react-router-dom";

function Access() {
  const [currentAccess, setCurrentAccess] = useState(null);
  const { hash } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const data = getDummyData();
    const record = data.find((item) => item.hash === hash);

    if (!record) {
      // If no record is found for the hash, redirect to the NoPage component
      navigate("/file-does-not-exist");
    } else {
      if (record.password !== null) {
        if (!sessionStorage.getItem(`access_granted_${hash}`)) {
          const password = prompt("Enter password:");
          if (password === record.password) {
            sessionStorage.setItem(`access_granted_${hash}`, true);
            setCurrentAccess(record);
          } else {
            alert("Invalid password");
            navigate("/home");
          }
        } else {
          setCurrentAccess(record);
        }
      } else {
        setCurrentAccess(record);
      }
    }
  }, [hash, navigate]);

  const handleDownloadClick = () => {
    if (currentAccess && currentAccess.storageAddress) {
      // Use the hash as the file name, appending ".zip"
      const fileName = `${hash}.zip`;
      downloadFile(currentAccess.storageAddress, fileName);
    }
  };


  const calculateNumberFiles = () => {
    return currentAccess ? currentAccess.numberofFiles : "Loading...";
  };

  const calculateTotalSize = () => {
    const totalBytes = currentAccess
      ? parseInt(currentAccess.TotalByteSize, 10)
      : 0;

    if (totalBytes >= 1e9) {
      return (totalBytes / 1e9).toFixed(2) + " GB";
    } else if (totalBytes >= 1e6) {
      return (totalBytes / 1e6).toFixed(2) + " MB";
    } else if (totalBytes >= 1e3) {
      return (totalBytes / 1e3).toFixed(2) + " KB";
    } else {
      return totalBytes + " bytes";
    }
  };

  const downloadFile = (url, fileName) => {
    fetch(url, {
      method: "get",
      mode: "no-cors",
      referrerPolicy: "no-referrer",
    })
      .then((res) => res.blob())
      .then((res) => {
        const aElement = document.createElement("a");
        aElement.setAttribute("download", fileName);
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.click();
        URL.revokeObjectURL(href);
      })
      .catch((error) => console.error("Download failed:", error));
  };

  return (
    <div className="access-container">
      <div>
        <Link to="/home" className="kite-link">
          KITE
        </Link>
        <button
          onClick={() => (window.location.href = "./upload")}
          className="Upload-button"
        >
          UPLOAD
        </button>
      </div>
      <div className="access-number">
        {currentAccess ? currentAccess.hash : "Loading..."}
      </div>
      <div className="stats">
        Number of Files:{" "}
        <span className="stat-color">{calculateNumberFiles()}</span>
        <br />
        Total Size: <span className="stat-color">{calculateTotalSize()}</span>
      </div>
      <button className="download-button" onClick={handleDownloadClick}>
        DOWNLOAD ZIP
      </button>
    </div>
  );
}

export default Access;
