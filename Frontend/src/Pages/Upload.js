import React, { useState, useEffect } from "react";
import "../CSS/Upload.css";
import ImageModal from "../Components/DisplayModal.js";
import { saveAs } from "file-saver";

function Upload() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState(10);
  const [timeToLive, setTimeToLive] = useState(24);
  const [havePassword, setHavePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const calculateTotalSize = () => {
    const totalBytes = files.reduce(
      (total, file) => total + file.sizeInBytes,
      0
    );
    return formatBytes(totalBytes);
  };

  const deleteFile = (index) => {
    setFiles((prevFiles) => {
      // Create a new array without the file at the given index
      const newFiles = prevFiles.filter((_, i) => i !== index);
      return newFiles;
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const newFiles = e.dataTransfer.files;
    if (newFiles) {
      handleFiles(newFiles);
    }
  };

  const handleChange = (e) => {
    const newFiles = e.target.files;
    if (newFiles) {
      handleFiles(newFiles);
    }
  };

  const fileIcons = {
    "3GP": "3GP.png",
    AI: "AI.png",
    APK: "APK.png",
    AVI: "AVI.png",
    BIN: "BIN.png",
    BMP: "BMP.png",
    C: "C.png",
    CDR: "CDR.png",
    CPP: "CPP.png",
    CS: "CS.png",
    CSS: "CSS.png",
    DMG: "DMG.png",
    DMP: "DMP.png",
    DOC: "DOC.png",
    DOCX: "DOCX.png",
    EPS: "EPS.png",
    EPUB: "EPUB.png",
    EXE: "EXE.png",
    FLAC: "FLAC.png",
    GIF: "GIF.png",
    H: "H.png",
    HEIC: "HEIC.png",
    HTML: "HTML.png",
    ICO: "ICO.png",
    ISO: "ISO.png",
    JAR: "JAR.png",
    JAVA: "JAVA.png",
    JS: "JS.png",
    M4A: "M4A.png",
    MKV: "MKV.png",
    MOV: "MOV.png",
    MP3: "MP3.png",
    MP4: "MP4.png",
    MSI: "MSI.png",
    OGG: "OGG.png",
    OTF: "OTF.png",
    PDF: "PDF.png",
    PHP: "PHP.png",
    PPT: "PPT.png",
    PPTX: "PPTX.png",
    PRPROJ: "PRPROJ.png",
    PSD: "PSD.png",
    PY: "PY.png",
    RAR: "RAR.png",
    RSS: "RSS.png",
    RTF: "RTF.png",
    SH: "SH.png",
    SVG: "SVG.png",
    TAR: "TAR.png",
    TIFF: "TIFF.png",
    TTF: "TTF.png",
    TXT: "TXT.png",
    VB: "VB.png",
    WAV: "WAV.png",
    WMA: "WMA.png",
    WMV: "WMV.png",
    WSF: "WSF.png",
    XHTML: "XHTML.png",
    XLS: "XLS.png",
    XLSM: "XLSM.png",
    XLSX: "XLSX.png",
    XML: "XML.png",
    COMPRESSED: "COMPRESSED.png",
    // Default icon for unlisted file types
    DEFAULT: "FILE.png",
  };

  const compressedFileExtensions = [
    "7Z",
    "ZIP",
    "GZ",
    "BZ2",
    "LZ",
    "LZMA",
    "LZO",
    "XZ",
    "Z",
    "ZST",
    "ARJ",
    "TAR.GZ",
    "TGZ",
    "TAR.BZ2",
    "TBZ",
    "TBZ2",
    "TAR.LZ",
    "TLZ",
    "TAR.LZMA",
    "TAR.LZO",
    "TAR.XZ",
    "TXZ",
    "TAR.Z",
    "TAR.ZST",
    "WAR",
    "EAR",
    "PKG",
    "DEB",
    "RPM",
    "VHD",
    "DAA",
  ];

  const getFileIconURL = (filename) => {
    const extension = filename.split(".").pop().toUpperCase();
    if (compressedFileExtensions.includes(extension)) {
      return window.location.origin + "/images/COMPRESSED.png";
    } else {
      const iconFileName = fileIcons[extension] || fileIcons["DEFAULT"];
      return window.location.origin + "/Images/" + iconFileName;
    }
  };

  const handleFiles = (newFiles) => {
    Array.from(newFiles).forEach((file) => {
      // Function to check and modify the filename if it's a duplicate
      const getUniqueFileName = (originalFile) => {
        let newName = originalFile.name;
        let counter = 1;
        while (files.some((f) => f.name === newName)) {
          const extension = originalFile.name.split(".").pop();
          const baseName = originalFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
          newName = `${baseName}(${counter}).${extension}`;
          counter++;
        }
        return newName;
      };

      // Create a new File object with a unique name if necessary
      let newName = getUniqueFileName(file);
      let fileWithUniqueName = file;
      if (newName !== file.name) {
        fileWithUniqueName = new File([file], newName, { type: file.type });
      }

      const previewURL = getFileIconURL(newName);
      let newFileObject = createFileObject(fileWithUniqueName, previewURL);

      setFiles((prevFiles) => [...prevFiles, newFileObject]);

      if (fileWithUniqueName.type.startsWith("image/")) {
        // For image files, update the preview URL immediately
        const imagePreviewURL = URL.createObjectURL(fileWithUniqueName);
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.name === newName ? { ...f, previewURL: imagePreviewURL } : f
          )
        );
      } else if (
        fileWithUniqueName.type.startsWith("video/") &&
        !isSmallDevice()
      ) {
        // For video files, process to get the thumbnail
        extractVideoThumbnail(fileWithUniqueName).then((videoThumbnailURL) => {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.name === newName ? { ...f, previewURL: videoThumbnailURL } : f
            )
          );
        });
      }
    });
  };

  const isSmallDevice = () => {
    return window.innerWidth < 800;
  };

  const extractVideoThumbnail = (file) => {
    return new Promise((resolve) => {
      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(file);
      videoElement.muted = true;
      videoElement.play();

      videoElement.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext("2d");

        // Draw the video frame
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Draw the play button
        drawPlayButton(context, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
        });

        videoElement.src = ""; // Clean up
      });

      videoElement.currentTime = 1; // Seek to a second into the video
    });
  };

  const drawPlayButton = (context, width, height) => {
    context.fillStyle = "rgba(0, 0, 0, 0.3)"; // Semi-transparent black
    context.fillRect(0, 0, width, height); // Cover the entire thumbnail

    context.fillStyle = "#FFFFFF"; // White color for the play symbol
    const triangleSize = width / 8; // Adjust the size of the play symbol
    const centerX = width / 2;
    const centerY = height / 2;

    context.beginPath();
    context.moveTo(centerX - triangleSize / 2, centerY - triangleSize / 2);
    context.lineTo(centerX + triangleSize / 2, centerY);
    context.lineTo(centerX - triangleSize / 2, centerY + triangleSize / 2);
    context.fill();
  };

  const createFileObject = (file, previewURL) => {
    return {
      name: file.name,
      size: formatBytes(file.size),
      sizeInBytes: file.size,
      selected: false,
      previewURL: previewURL,
    };
  };

  const settingsBox = files.length > 0 && (
    <div className="settings-container">
      <div className="setting">
        <label id="max-downloads-label">Max downloads (1-100)</label>
        <input
          type="number"
          className="number-input"
          id="max-downloads"
          value={maxDownloads}
          onChange={(e) => setMaxDownloads(e.target.value)}
        />
      </div>

      <div className="setting">
        <label id="delete-after-label">Delete after (1-24 hours)</label>
        <input
          type="number"
          className="number-input"
          id="delete-after"
          value={timeToLive}
          onChange={(e) => setTimeToLive(e.target.value)}
        />
      </div>

      <div className="setting">
        <label id="password-label">Password</label>
        <div className="password-container">
          <i onClick={() => setHavePassword(!havePassword)}>
            {havePassword ? (
              <span class="material-symbols-outlined password-symbol">
                check_box
              </span>
            ) : (
              <span class="material-symbols-outlined password-symbol">
                check_box_outline_blank
              </span>
            )}
          </i>
          {havePassword && (
            <>
              <input
                type={showPassword ? "text" : "password"}
                className="password-input"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <span class="material-symbols-outlined password-symbol">
                    visibility
                  </span>
                ) : (
                  <span class="material-symbols-outlined password-symbol">
                    visibility_off
                  </span>
                )}
              </i>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const [selectedImage, setSelectedImage] = useState(null);

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const openImageModal = (file) => {
    if (/\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(file.name))
      setSelectedImage({ url: file.previewURL, name: file.name });
  };

  // Function to generate a unique and readable filename based on the current date and time
  const generateMetadataFilename = () => {
    const now = new Date();
    // Format: "metadata-YYYY-MM-DD_HH-MM-SS.json"
    const filename = `metadata-${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}_${now
      .getHours()
      .toString()
      .padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}-${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}.json`;
    return filename;
  };

  const handleUpload = async () => {
    // Before creating metadata, check for any faulty upload settings and alert the user
    if (
      maxDownloads < 1 ||
      maxDownloads > 100 ||
      timeToLive < 1 ||
      timeToLive > 24 ||
      (havePassword && password == "")
    ) {
      // Multiple if statements to allow multiple error checking at once
      // Highlight the errored field red for the user to resolve
      if (maxDownloads < 1 || maxDownloads > 100) {
        document.getElementById("max-downloads").style["border-color"] =
          "var(--red)";
        document.getElementById("max-downloads").style.color = "var(--red)";
        document.getElementById("max-downloads-label").style.color =
          "var(--red)";
      }
      if (timeToLive < 1 || timeToLive > 24) {
        document.getElementById("delete-after").style["border-color"] =
          "var(--red)";
        document.getElementById("delete-after").style.color = "var(--red)";
        document.getElementById("delete-after-label").style.color =
          "var(--red)";
      }
      if (havePassword && password == "") {
        document.getElementById("password").style["border-color"] =
          "var(--red)";
        document.getElementById("password").style.color = "var(--red)";
        document.getElementById("password-label").style.color = "var(--red)";
        document.querySelectorAll(".password-symbol").forEach((symbol) => {
          symbol.style.color = "var(--red)";
        });
      }
    } else {
      // Show loading indicator
      setIsLoading(true);

      // Constructing metadata with all file names
      const filesMetadata = files.map((file, index) => ({
        [`file ${index + 1}`]: file.name,
      }));

      const metadata = {
        maxDownloads: maxDownloads,
        timeToLive: timeToLive,
        password: havePassword ? password : null,
        uploadTimestamp: new Date().toISOString(),
        files: filesMetadata,
      };

      try {
        // Convert metadata to a Blob in JSON format
        const blob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: "application/json",
        });

        // Generate a unique and readable file name based on the current date and time
        const filename = generateMetadataFilename();

        // Save the metadata.json file locally with the unique filename
        saveAs(blob, filename);
      } catch (error) {
        console.error("Error during metadata file creation:", error);
        alert("Failed to create metadata file.");
      }

      setIsLoading(false); // Hide loading indicator

      // After upload, redirect to the Uploaded webpage
      window.location.href = "./Uploaded";
    }
  };

  /*
    // Uncomment the following lines to enable server-side upload logic

  // Prepare the form data
  let formData = new FormData();
  formData.append("file", blob, filename);

  // Specify your server upload endpoint URL here
  const uploadUrl = "http://yourserver.com/uploadMetadata";

  try {
    // Use fetch API to upload the metadata
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server responded with an error during file upload");
    }

    // Process the response from your server
    const result = await response.json();
    console.log("Server response:", result);
    alert("Metadata uploaded to server successfully.");
  } catch (error) {
    console.error("Error during file upload:", error);
    alert("Failed to upload metadata.");
  }

  setIsLoading(false); // Hide loading indicator
};
*/

  return (
    <div className="upload-container-uploadbox">
      {isLoading && <div className="loading-overlay">Uploading...</div>}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          imageName={selectedImage.name}
          onClose={closeImageModal}
        />
      )}

      <div>
        <a href="./home" className="kite-link">
          KITE
        </a>
      </div>
      <form
        className={`drop-zone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          className="file-input"
          onChange={handleChange}
          multiple
        />
        <div className="drop-message">
          Drag and drop files here or{" "}
          <label htmlFor="file-upload" className="upload-link">
            browse
          </label>
        </div>
        {files.length > 0 && (
          <div>
            <div className="file-display-container">
              {files.map((file, index) => (
                <div className="file-row">
                  <div
                    className="selectable-file-region"
                    key={index}
                    onClick={() => openImageModal(file)}
                  >
                    {file.previewURL && (
                      <img
                        src={file.previewURL}
                        alt="Preview"
                        style={{ width: "50px", height: "50px" }}
                        onError={(e) => {
                          e.target.src =
                            window.location.origin + "/images/FILE.png"; // Fallback to default image on error
                        }}
                      />
                    )}
                    <div className="file-info">
                      <span className="file-name" title={file.name}>
                        {file.name}
                      </span>
                      <span className="file-size">({file.size})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFile(index)}
                    className="delete-button"
                    type="button"
                    aria-label="Delete file"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
      {files.length > 0 && (
        <>
          {settingsBox} {/* Settings Box will appear here */}
          <div className="upload-actions-container">
            <div className="totalsize">
              Total Size:{" "}
              <span className="total-size-color">{calculateTotalSize()}</span>
            </div>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isLoading}
              className="upload-files"
            >
              UPLOAD FILES
            </button>
          </div>
        </>
      )}
    </div>
  );
}
export default Upload;
