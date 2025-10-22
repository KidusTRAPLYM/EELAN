function GetStartedButton() {
  const handleGetStarted = () => {
    // Your email for Ciphree
    const yourEmail = "elan.mpr@gmail.com"; // REPLACE WITH YOUR EMAIL
    // Pre-filled email subject and body
    const subject = encodeURIComponent("Ciphry Early Access Request");
    const body = encodeURIComponent(
      "Hey @Ciphree_, I’m hyped for Ciphry early access! Sign me up! #FeelHeard"
    );
    // Mailto URL
    const mailtoUrl = `mailto:${yourEmail}?subject=${subject}&body=${body}`;

    // Open email client
    window.location.href = mailtoUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F1A1B] px-6">
      <h1 className="text-primary text-3xl md:text-4xl font-bold font-clash mb-10 text-center">
        Ready to Feel Heard?
      </h1>

      <button
        onClick={handleGetStarted}
        className="bg-primary text-white font-clash px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md text-xl"
      >
        Get Started
      </button>

      <p className="font-clash text-gray-400 text-sm mt-4 text-center">
        Click to email for Ciphry early access! #FeelHeard
      </p>
    </div>
  );
}

export default GetStartedButton;
