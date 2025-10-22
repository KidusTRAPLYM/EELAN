import logo from "./logo2.png";

function Footer() {
  return (
    <footer className="footer font-clash bg-primary text-white py-12 px-6 md:px-20 rounded-[40px] mx-4 md:mx-20 mb-12">
      {/* Top section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 md:gap-0">
        {/* About company */}
        <div className="about-company flex flex-col gap-2">
          <div className="first flex items-center gap-3">
            <img src={logo} alt="Ciphree Logo" className="w-10 h-10" />
            <h1 className="text-xl md:text-2xl font-bold">Ciphree</h1>
          </div>
          <p className="text-gray-200 max-w-full md:max-w-xs text-sm sm:text-base">
            A company dedicated to helping people connect meaningfully with
            others.
          </p>
        </div>

        {/* Newsletter */}
        <div className="subscribe flex flex-col gap-3 w-full md:w-auto">
          <h2 className="text-lg md:text-xl font-semibold text-center md:text-left">
            Subscribe for our newsletter
          </h2>
          <input
            type="email"
            placeholder="Enter your email"
            className="font-clash p-3 rounded-lg text-black w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
          />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex justify-center text-gray-300 text-sm sm:text-base">
        <p>© 2025 Ciphree. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
