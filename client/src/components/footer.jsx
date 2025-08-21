import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-green-400 border-green-500 mt-0 shadow-lg">
      <div className="text-center text-sm text-green-500 border-t border-green-800 py-4">
        © {new Date().getFullYear()} PassCrypt. All rights reserved.  | <span>adityagw20@gmail.com</span>
      </div>
    </footer>
  );
};

export default Footer;
