import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override: React.CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "#FFF",
  border: "5px solid #FFF",
};

export default function Loading() {
  const [loading] = useState(true);
  const [color] = useState("#ffffff");

  return (
    <div className="loader-area">
      <ClipLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}
