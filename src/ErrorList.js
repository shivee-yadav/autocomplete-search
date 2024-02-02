import React from "react";

function ErrorList({ errors }) {
  return (
    <div className="error-list">
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  );
}

export default ErrorList;
