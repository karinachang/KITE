import React, { useState } from "react";
import "../CSS/Access.css";

function Access() {
  const [files, setFiles] = useState([
    {
      name: "Karina.png",
      sizeInBytes: 3565158, // 3.4 MB in bytes
      checked: false,
    },
    {
      name: "Iftesam.jpeg",
      sizeInBytes: 2411724, // 2.3 MB in bytes
      checked: false,
    },
    {
      name: "Taylar.mp4",
      sizeInBytes: 92274688, // 88 MB in bytes
      checked: false,
    },
    {
      name: "Ethan.wav",
      sizeInBytes: 10276044, // 9.8 MB in bytes
      checked: false,
    },
    {
      name: "Capstone.pdf",
      sizeInBytes: 2411724, // 2.3 MB in bytes
      checked: false,
    },
  ]);
  const [selectAll, setSelectAll] = useState(false);
  const [accessNumber, setAccessNumber] = useState("318278");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setFiles(files.map((file) => ({ ...file, checked })));
  };

  const handleDownloadClick = () => {
    const isAnyFileSelected = files.some((file) => file.checked);
    if (isAnyFileSelected) {
      setShowDownloadModal(true);
      // Actual logic that initiates the download
        downloadFile('https://storage.googleapis.com/kitebucket/testfolder/heeyaw.png', 'test.js')
    } else {
      alert("Please select at least one file to download.");
    }
  };

  const handleCloseModal = () => {
    setShowDownloadModal(false);
  };

  const DownloadModal = () => (
    <div className="download-modal">
      <p>
              Your download will start shortly. If not, <a href="https://storage.googleapis.com/kitebucket/testfolder/heeyaw.png">click here</a>.
      </p>
      <button onClick={handleCloseModal}>Close</button>
    </div>
  );

  const handleCheck = (index) => {
    const newFiles = [...files];
    newFiles[index].checked = !newFiles[index].checked;
    setFiles(newFiles);
    setSelectAll(newFiles.every((file) => file.checked));
  };

  const calculateTotalSize = () => {
    const totalBytes = files.reduce((total, file) => {
      return file.checked ? total + file.sizeInBytes : total;
    }, 0);

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
    <div
      className={`access-container ${
        showDownloadModal ? "blur-background" : ""
      }`}
    >
      <div>
        <a href="./home" className="kite-link">
          KITE
        </a>
        <button
          onClick={() => (window.location.href = "./upload")}
          className="Upload-button"
        >
          Upload
        </button>
      </div>
      <input
        type="text"
        className="access-number-input"
        value={accessNumber}
        onChange={(e) => setAccessNumber(e.target.value)}
        maxLength={6}
      />
      <button className="access-button">ACCESS FILES</button>
      <div className="file-list">
        <div className="file-item select-all">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <div className="file-info"></div>
        </div>
        {files.map((file, index) => (
          <div className="file-item" key={index}>
            <input
              type="checkbox"
              checked={file.checked}
              onChange={() => handleCheck(index)}
            />
            <div className="file-info">{file.name}</div>
            <div className="file-info">
              {(file.sizeInBytes / 1e6).toFixed(2)} MB
            </div>
          </div>
        ))}
      </div>
      <div className="totalsize">
        Total Selected Size:{" "}
        <span className="total-size-color">{calculateTotalSize()}</span>
      </div>
      {showDownloadModal && (
        <div className="modal-overlay">
          <div className="download-modal">
            <p>
              Your download will start shortly. If not,{" "}
              <a href="https://storage.googleapis.com/kitebucket/testfolder/heeyaw.png" onClick={() => { downloadFile('https://www.google-analytics.com/analytics.js', 'download.png') } }>click here</a>.
            </p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
      <button className="download-button" onClick={handleDownloadClick}>
        DOWNLOAD
      </button>
    </div>
  );
}

export default Access;
