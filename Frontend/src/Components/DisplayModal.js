import React, { useEffect } from "react";
import "../CSS/DisplayModal.css";

const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <img src={imageUrl} alt="Zoomed In" className="modal-image" />
        <button onClick={onClose} className="close-button">
          X
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
