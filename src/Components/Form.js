import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

function GetStartedButton() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGetStarted = async () => {
    if (!name || !email) return alert("Please fill all fields");
    setLoading(true);
    try {
      await addDoc(collection(db, "earlyAccessRequests"), {
        name,
        email,
        timestamp: new Date(),
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F1A1B] px-6 font-clash">
      <h1 className="text-primary text-4xl md:text-5xl font-bold mb-6 text-center animate-slideFadeDown">
        Ready to Feel Heard?
      </h1>

      <div className="flex flex-col items-center gap-4 w-full max-w-sm bg-[#1C2526] rounded-2xl p-6">
        {/* Name input */}
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 h-12 rounded-lg bg-[#0F1A1B] border border-gray-600 text-white font-clash focus:outline-none"
        />
        {/* Email input */}
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 h-12 rounded-lg bg-[#0F1A1B] border border-gray-600 text-white font-clash focus:outline-none"
        />

        {/* Button */}
        <button
          onClick={handleGetStarted}
          className="bg-primary text-white px-8 py-3 rounded-xl font-semibold text-xl disabled:opacity-50"
          disabled={loading || success}
        >
          {loading
            ? "Submitting..."
            : success
            ? "Request Sent!"
            : "Get Started"}
        </button>

        {/* Message */}
        <p className="text-gray-400 text-sm mt-4 text-center">
          {success
            ? "Thank you! We'll notify you for early access. #FeelHeard"
            : "Click to request Ciphry early access! #FeelHeard"}
        </p>
      </div>
    </div>
  );
}

export default GetStartedButton;
