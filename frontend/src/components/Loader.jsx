import React from "react";

const Loader = () => {
  return (
    <>
      {/* Inject animation directly so it never fails */}
      <style>
        {`
          @keyframes custom-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Bulletproof inline styles to force it to the absolute front */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(5px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999 // Guaranteed to be on top
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "5px solid #E5E7EB",
          borderTop: "5px solid #4F46E5",
          borderRadius: "50%",
          animation: "custom-spin 1s linear infinite"
        }}></div>
        <h2 style={{ marginTop: "20px", color: "#4F46E5", fontWeight: "bold", fontSize: "1.2rem" }}>
          Loading...
        </h2>
      </div>
    </>
  );
};

export default Loader;