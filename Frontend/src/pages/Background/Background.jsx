import React from "react";
import "./Background.css";

const Background = () => {
  return (
    <div className="hero-background">
      <div className="scene background-container">
        <span className="scene__dots" style={{ "--y": "-73px" }}></span>
        <span
          className="scene__line scene__line--darkblue"
          style={{ "--x": "35%", "--y": "60%", "--rotate": "243deg" }}
        ></span>
        <span
          className="scene__line scene__line--lightblue scene__line--medium"
          style={{ "--x": "80%", "--y": "60%", "--rotate": "255deg" }}
        ></span>
        <span
          className="scene__line scene__line--lightblue scene__line--large"
          style={{ "--x": "7%", "--y": "29%", "--rotate": "276deg" }}
        ></span>
        <span
          className="scene__line scene__line--darkblue scene__line--xlarge"
          style={{ "--x": "55%", "--y": "-10%", "--rotate": "443deg" }}
        ></span>
        <span
          className="scene__line scene__line--darkblue"
          style={{ "--x": "75%", "--y": "40%", "--rotate": "304deg" }}
        ></span>
        <span
          className="scene__line scene__line--lightblue"
          style={{ "--x": "48%", "--y": "80%", "--rotate": "218deg" }}
        ></span>
        <span
          className="scene__line scene__line--darkblue scene__line--medium"
          style={{ "--x": "17%", "--y": "86%", "--rotate": "242deg" }}
        ></span>
        <span
          className="scene__line scene__line--large scene__line--darkblue"
          style={{ "--x": "78%", "--y": "72%", "--rotate": "269deg" }}
        ></span>
        <span
          className="scene__line scene__line--large scene__line--lightblue"
          style={{ "--x": "72%", "--y": "12%", "--rotate": "365deg" }}
        ></span>
        <span
          className="scene__line scene__line--lightblue"
          style={{ "--x": "53%", "--y": "52%", "--rotate": "349deg" }}
        ></span>
        <span
          className="scene__line scene__line--xlarge scene__line--lightblue"
          style={{ "--x": "98%", "--y": "29%", "--rotate": "292deg" }}
        ></span>
        <span
          className="scene__line scene__line--lightblue"
          style={{ "--x": "64%", "--y": "120%", "--rotate": "152deg" }}
        ></span>
        <span
          className="scene__line scene__line--medium scene__line--lightblue"
          style={{ "--x": "32%", "--y": "130%", "--rotate": "100deg" }}
        ></span>
      </div>
    </div>
  );
};

export default Background;
