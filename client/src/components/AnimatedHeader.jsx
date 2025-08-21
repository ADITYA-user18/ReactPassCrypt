import React from "react";
import { TypeAnimation } from "react-type-animation";
import "./AnimatedHeader.css"; 

const AnimatedHeader = () => {
  return (
    <div className="header m-auto my-0 flex items-center">
      <i className="ri-code-s-slash-line text-green-400 text-4xl font-bold"></i>
      <TypeAnimation
        sequence={[
          "**********",
          1000,
          "PassCrypt",
          2000,
        ]}
        wrapper="span"
        speed={50}
        className="text-4xl font-bold text-green-400 ml-2 bounce"      
      />
    </div>
  );
};

export default AnimatedHeader;