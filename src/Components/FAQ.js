import { useState } from "react";

function FAQ() {
  const faqData = [
    {
      question: "Is Ciphree free?",
      answer:
        "Yes! Ciphree is completely free to use for all users. Premium features will be optional in the future.",
    },
    {
      question: "How does Ciphree really work?",
      answer:
        "Ciphree uses emotional AI to match you with friends who understand you, helping you build meaningful connections.",
    },
    {
      question: "Does Ciphree only focus on ADHD people?",
      answer:
        "No, while Ciphree is tailored to ADHD users, anyone looking for emotional connection can use the platform.",
    },
    {
      question: "What if I don’t get the friends I want?",
      answer:
        "Our AI continuously learns from your preferences and interactions, improving your matches over time.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="FAQ text-white font-clash flex flex-col items-center py-16 px-4 sm:px-6 md:px-20 bg-[#0F1A1B]">
      <h1 className="text-primary text-3xl sm:text-3xl md:text-4xl font-bold mb-12 text-center">
        FREQUENTLY ASKED QUESTIONS (FAQ)
      </h1>

      <div className="questions flex flex-col gap-4 w-full max-w-4xl">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="question flex flex-col border-b border-primary rounded-xl cursor-pointer hover:bg-[#162122] transition-colors duration-300 overflow-hidden"
          >
            <div
              className="flex justify-between items-center p-4 sm:p-5 md:p-6"
              onClick={() => toggleFAQ(index)}
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                {item.question}
              </h2>
              <span className={`text-2xl sm:text-3xl font-bold ml-2`}>
                {openIndex === index ? "−" : "+"}
              </span>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 px-4 sm:px-6 md:px-6 ${
                openIndex === index
                  ? "max-h-72 py-2 sm:py-3 md:py-4"
                  : "max-h-0"
              }`}
            >
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;
