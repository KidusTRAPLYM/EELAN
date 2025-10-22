import { useState, useEffect } from "react";
import logo from "../logo2.png";
import { Link } from "react-router-dom";

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full fixed top-0 z-50 transition-all duration-500 font-clash ${
        scrolled
          ? "bg-white shadow-lg py-3 md:py-4"
          : "bg-[#0F1A1B] py-4 md:py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Ciphree Logo"
            className={`h-8 md:h-12 transition-all duration-500 ${
              scrolled ? "brightness-0 invert" : ""
            }`}
          />
          <h1
            className={`ml-2 text-xl md:text-2xl font-bold transition-colors duration-500 ${
              scrolled ? "text-primary" : "text-white"
            }`}
          >
            Ciphree
          </h1>
        </div>

        {/* Button */}
        <div className="flex items-center">
          <button
            className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              scrolled
                ? "bg-primary hover:bg-blue-600 text-white shadow-md"
                : "bg-primary hover:bg-blue-600 text-white shadow-md"
            }`}
          >
            <Link to="/register"> Get Started</Link>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
