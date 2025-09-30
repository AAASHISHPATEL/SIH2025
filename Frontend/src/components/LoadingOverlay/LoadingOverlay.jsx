import PropTypes from "prop-types";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ label = "Loading..." }) => {
  return (
    <div className="overlay">
      <div className="spinner"></div>
      <div className="label">{label}</div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  label: PropTypes.string, // ✅ validate label as string
};

export default LoadingOverlay;
