"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <span
        style={{ position: "absolute", right: "8px", top: "8px" }}
        onClick={onClose}
      >
        <FontAwesomeIcon
          icon={faXmarkCircle}
          size="2x"
          color="#fff"
          style={{
            opacity: "0.8",
            cursor: "pointer",
            backgroundColor: "#3b3d3ed1",
            borderRadius: "20px",
          }}
        />
      </span>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <img
          src="/content/Move_02.gif"
          width="40%"
          height="auto"
          alt="movement-info"
        />
        <img
          src="/content/Tap_02.gif"
          width="40%"
          height="auto"
          alt="tap-info"
        />
      </div>
    </div>
  );
}
