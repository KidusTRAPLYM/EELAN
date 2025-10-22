import { useRef, useEffect, useState } from "react";

function Middle() {
  const topRef = useRef(null);
  const [topVisible, setTopVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === "top" && entry.isIntersecting) {
            setTopVisible(true);
          }
          if (entry.target.id === "bottom" && entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (topRef.current) observer.observe(topRef.current);
    const bottomEl = document.getElementById("bottom");
    if (bottomEl) observer.observe(bottomEl);

    return () => {
      if (topRef.current) observer.unobserve(topRef.current);
      if (bottomEl) observer.unobserve(bottomEl);
    };
  }, []);

  return (
    <section className="middle font-clash flex flex-col gap-12 py-12 sm:py-16 px-4 sm:px-6 md:px-20 bg-[#0F1A1B]">
      {/* Top description */}
      <div
        id="top"
        ref={topRef}
        className={`top transition-all duration-700 ${
          topVisible ? "animate-slideFadeDown" : "opacity-0"
        }`}
      >
        <p className="text-white text-lg sm:text-xl md:text-3xl font-semibold text-center max-w-3xl mx-auto leading-relaxed">
          Ciphree combines emotion and AI to connect people who truly get you.
        </p>
      </div>

      {/* Bottom stats */}
      <div
        id="bottom"
        className={`bottom flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-8 bg-primary text-white rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-700 ${
          statsVisible ? "animate-slideFadeUp" : "opacity-0"
        }`}
      >
        {/* Launch Date */}
        <div className="launch flex flex-col items-center gap-2 cursor-default">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Launch Date
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-center">
            2 Nov 2025
          </p>
        </div>

        {/* Subscribers */}
        <div className="subs flex flex-col items-center gap-2 cursor-default">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Subscribers
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-center">26</p>
        </div>

        {/* Newsletter */}
        <div className="newsletter flex flex-col items-center gap-2 cursor-default">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Newsletter
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-center">16</p>
        </div>
      </div>
    </section>
  );
}

export default Middle;
