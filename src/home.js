import HomeImage from "./peopleTalking.png";
import { Link } from "react-router-dom";
function Home() {
  return (
    <section className="home font-clash flex flex-col md:flex-row items-center justify-between p-6 md:p-20 gap-12 bg-[#0F1A1B] min-h-screen overflow-hidden pt-24 md:pt-32">
      <div className="left flex flex-col gap-6 w-full md:w-1/2 animate-slideFadeLeft">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-snug tracking-tight">
          Connect with ADHD friends instantly for free!
        </h1>
        <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed">
          Ciphree helps you find friends who truly get you, powered by emotional
          AI. Build meaningful connections instantly.
        </p>
        <button className="bg-primary rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-white w-full sm:w-64 md:w-auto btn-shadow font-semibold">
          <Link to="/register"> Get Started</Link>
        </button>
      </div>

      <div className="right w-full md:w-1/2 flex justify-center animate-slideFadeRight">
        <img
          src={HomeImage}
          alt="People talking illustration"
          className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl object-contain"
        />
      </div>
    </section>
  );
}

export default Home;
