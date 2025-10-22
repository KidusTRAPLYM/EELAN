import AIfriendMatcher from "../image3.png";
import MiniGames from "../image4.png";
import Journaling from "../image5.png";

function Features() {
  const featureData = [
    {
      image: AIfriendMatcher,
      title: "AI Friend Matching Based on Emotions",
      description:
        "Matches you with friends based on your mood using AI, creating quick, meaningful connections.",
    },
    {
      image: MiniGames,
      title: "Mini-games While Waiting",
      description:
        "Fun games to play while the AI finds your match, keeping you entertained.",
    },
    {
      image: Journaling,
      title: "Journaling",
      description:
        "A smart journal that adapts to your emotions, offering tailored prompts and insights.",
    },
  ];

  return (
    <section className="Features text-white font-clash py-16 px-6 md:px-20 bg-[#0F1A1B]">
      <h1 className="text-primary text-3xl md:text-4xl font-bold text-center mb-12">
        Features
      </h1>

      <div className="features flex flex-col sm:flex-row flex-wrap gap-6 md:gap-8 justify-center md:justify-between items-center">
        {featureData.map((feature, index) => (
          <div
            key={index}
            className="feature flex flex-col items-center text-center bg-[#162122] p-6 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 w-full sm:w-[45%] md:w-[30%]"
          >
            <img src={feature.image} alt={feature.title} className="" />
            <h2 className="text-primary text-xl md:text-2xl font-semibold mb-2">
              {feature.title}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
