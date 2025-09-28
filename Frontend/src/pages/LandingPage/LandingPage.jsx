import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for navigation
import "./LandingPage.css";

export default function LandingPage() {
  const draggableRef = useRef(null);
  const navigate = useNavigate();

  // Draggable logic
  useEffect(() => {
    const elmnt = draggableRef.current;
    if (!elmnt) return;

    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    const dragMouseDown = (e) => {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e) => {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      let newTop = elmnt.offsetTop - pos2;
      let newLeft = elmnt.offsetLeft - pos1;

      // clamp so blob stays inside window
      const maxTop = window.innerHeight - elmnt.offsetHeight;
      const maxLeft = window.innerWidth - elmnt.offsetWidth;

      if (newTop < 0) newTop = 0;
      if (newLeft < 0) newLeft = 0;
      if (newTop > maxTop) newTop = maxTop;
      if (newLeft > maxLeft) newLeft = maxLeft;

      elmnt.style.top = newTop + "px";
      elmnt.style.left = newLeft + "px";
    };

    const closeDragElement = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    elmnt.onmousedown = dragMouseDown;
    return () => {
      elmnt.onmousedown = null;
    };
  }, []);

  // ✅ Navigate to login page
  const handleLoginSignup = () => {
    navigate("/login");
  };

  return (
    <div className="fc-landing-body">
      {/* Icon */}
      <svg
        fill="#a1c4fd"
        style={{
          margin: "20px",
          mixBlendMode: "difference",
          position: "relative",
        }}
        height="30px"
        width="30px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          className="fc-st0"
          d="M230.816,493.781C235.722,504.969,245.425,512,256.003,512..."
        />
      </svg>

      {/* Tagline */}
      <h1 className="fc-title">
        Guess what? Your chats just got a new best friend—welcome to our latest
        creation!
      </h1>

      {/* Middle section */}
      <div className="fc-middle">
        <h2 className="fc-brand">FloatChat</h2>
        <div className="fc-card">
          <p className="fc-card-label">Chat Platform</p>
          <h2 className="fc-price">Free</h2>
          <div className="fc-btn hover:bg-slate-400" onClick={handleLoginSignup}>
            <p>Login / Signup</p>
            <div
              id="fc-toggler"
              className="fc-toggler"
              onClick={handleLoginSignup}
            >
              <img
                width="25"
                height="25"
                src="https://img.icons8.com/ios-filled/100/a1c4fd/user.png"
                alt="login-icon"
              />
            </div>
          </div>
        </div>
      </div>

      <h2 className="fc-bottom"> Drag 🧊 around to see the magic 🪄</h2>

      {/* Draggable blob */}
      <div className="fc-blob" id="fc-mydiv" ref={draggableRef}></div>

      <p className="fc-disclaimer">
        Designed & Created by SpectacledCoder | Icons by{" "}
        <a href="https://icons8.com/" target="_blank" rel="noreferrer">
          Icons8
        </a>{" "}
        | SVG by{" "}
        <a href="https://www.svgrepo.com/" target="_blank" rel="noreferrer">
          Svg Repo
        </a>
      </p>
    </div>
  );
}
