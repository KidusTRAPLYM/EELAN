import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

const ADMIN_PASSWORD = "7777"; // set your password here

function Admin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);

  const handlePassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthorized(true);
    } else {
      setWrongPassword(true);
    }
  };

  useEffect(() => {
    if (!authorized) return;

    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "earlyAccessRequests"),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests: ", err);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [authorized]);

  if (!authorized)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F1A1B] font-clash px-6">
        <h1 className="text-3xl text-white mb-6">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="p-3 rounded-lg bg-[#1C2526] border border-gray-600 text-white mb-4 w-full max-w-sm"
        />
        <button
          onClick={handlePassword}
          className="bg-primary text-white px-6 py-3 rounded-xl font-clash font-semibold"
        >
          Submit
        </button>
        {wrongPassword && (
          <p className="text-red-500 mt-3">Wrong password! Try again.</p>
        )}
      </div>
    );

  if (loading)
    return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#0F1A1B] px-6 py-10 font-clash flex flex-col items-center">
      <h1 className="text-4xl font-bold text-primary mb-8">
        Early Access Requests
      </h1>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-[#1C2526] p-4 rounded-2xl border border-gray-600"
          >
            <p className="text-white font-semibold">Name: {req.name}</p>
            <p className="text-white font-semibold">Email: {req.email}</p>
            <p className="text-gray-400 text-sm">
              {req.timestamp?.toDate().toLocaleString()}
            </p>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No requests yet.</p>
        )}
      </div>
    </div>
  );
}

export default Admin;
