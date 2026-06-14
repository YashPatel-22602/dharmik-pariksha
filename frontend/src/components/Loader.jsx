import React from "react";

const Loader = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.spinner}></div>

      <h2 style={styles.text}>
        Loading...
      </h2>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(255,255,255,0.95)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  spinner: {
    width: "70px",
    height: "70px",
    border: "6px solid #E5E7EB",
    borderTop: "6px solid #7a004b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },

  text: {
    marginTop: "20px",
    color: "#7a004b",
    fontWeight: "600",
    fontSize: "18px"
  }
};

export default Loader;