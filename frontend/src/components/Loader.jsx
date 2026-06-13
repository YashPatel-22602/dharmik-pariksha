import React from "react";

const Loader = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.loaderBox}>

        <div style={styles.hands}>
          🙏
        </div>

        <h2 style={styles.text}>
          Jay Shree Swaminarayan
        </h2>

        <div style={styles.dots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>

      </div>
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
    background:
      "linear-gradient(135deg,#FFF7ED,#FEF3C7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  loaderBox: {
    textAlign: "center"
  },

  hands: {
    fontSize: "80px",
    animation: "pulse 1.5s infinite"
  },

  text: {
    color: "#D97706",
    marginTop: "15px"
  },

  subText: {
    color: "#6B7280"
  },

  dots: {
    fontSize: "30px",
    color: "#F59E0B"
  }
};

export default Loader;