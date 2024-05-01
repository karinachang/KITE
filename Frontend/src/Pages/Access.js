import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/Access.css";
import { Link } from "react-router-dom";

function Access() {
  const [currentAccess, setCurrentAccess] = useState(null);
  const { hash } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentAccess) {
      fetch("/api/getTotalSize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: hash }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.totalSize) {
            // Update currentAccess with new totalSize
            setCurrentAccess((prevState) => ({
              ...prevState,
              TotalByteSize: data.totalSize,
            }));
          }
        })
        .catch((error) => {
          console.error("Failed to fetch total size:", error);
        });
    }
  }, [currentAccess, hash]); // Dependency on currentAccess and hash ensures this runs when they update

  useEffect(() => {
    // Fetch the record from the API
    fetch(`/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: hash }),
    })
      .then((resp) => {
        resp
          .json()
          .then((data) => {
            console.log(data);
            if (!data) {
              // If no data is returned, redirect
              navigate("/file-does-not-exist");
            } else if (data.password !== null) {
              // Check for password protection
              if (!sessionStorage.getItem(`access_granted_${hash}`)) {
                const password = prompt("Enter password:");
                if (password === data.password) {
                  sessionStorage.setItem(`access_granted_${hash}`, true);
                  setCurrentAccess(data);
                } else {
                  alert("Invalid password");
                  navigate("/home");
                }
              } else {
                setCurrentAccess(data);
              }
            } else {
              setCurrentAccess(data);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch data:", error);
            navigate("/file-does-not-exist");
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [hash, navigate]);

  const handleDownloadClick = () => {
    if (currentAccess && currentAccess.storageAddress) {
      let fileName = `${hash}.zip`;

      fetch("/api/downloadFile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: hash }),
      })
        .then((resp) => {
          resp
            .json()
            .then((json) => {
              console.log(json);
              //when stringified, json has "" around it, remove them
              let link = JSON.stringify(json).replace('"', "");
              link = link.replace('"', "");
              console.log(typeof link);
              console.log(link);

              // creating the anchor tag for the button
              const aElement = document.createElement("a");
              aElement.download = fileName;
              aElement.href = "/bucket/kitebucket/" + link;
              console.log("aElement: " + aElement.href);
              aElement.click();
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const calculateNumberFiles = () =>
    currentAccess ? currentAccess.numberofFiles : "Loading...";

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
          <img
            src={window.location.origin + "/Images/logo2white.png"}
            alt="KITE"
            className="kite-logo"
          ></img>
        </Link>
        <Link to="/upload" className="Upload-button">
          UPLOAD
        </Link>
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
