import React from "react";
import { Github, Linkedin } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-black px-6 py-3 flex items-center justify-between fixed top-0 left-0 w-full z-50">
     
      <div className="flex items-center gap-2 ml-7">
        <i className="ri-code-s-slash-line text-green-400 text-2xl"></i>
        <span className="text-xl font-bold text-green-400">PassCrypt</span>
      </div>

      
      <div className="flex items-center gap-6 mr-7">
       
        <a
          href="https://github.com/ADITYA-user18"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-white transition-colors duration-300"
        >
          <Github size={30} />
        </a>

       
        <a
          href="https://www.linkedin.com/in/aditya-g-wandakar-875007343/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-white transition-colors duration-300"
        >
          <Linkedin size={30} />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
